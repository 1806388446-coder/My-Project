import { hashCode, randomCode, randomId, signToken, verifySecret, verifyToken } from './security.js';

function json(status, body) {
  return { status, headers: { 'Content-Type': 'application/json' }, body };
}

function now() {
  return new Date().toISOString();
}

function getBearer(headers = {}) {
  const value = headers.Authorization ?? headers.authorization ?? '';
  return value.startsWith('Bearer ') ? value.slice(7) : null;
}

export function createHandlers({ store, tokenSecret, adminPasswordHash, photoStorage }) {
  async function auth(request) {
    const token = getBearer(request.headers);
    if (!token) return null;
    try {
      const payload = await verifyToken(token, tokenSecret);
      if (payload.role === 'admin') return payload;
      const editor = await store.getEditor(payload.editorId);
      if (!editor || editor.status !== 'active') return null;
      return { ...payload, displayName: editor.displayName };
    } catch {
      return null;
    }
  }

  function requireEditor(identity) {
    return identity && (identity.role === 'editor' || identity.role === 'admin');
  }

  return {
    async handle(request) {
      const { method, path, body = {} } = request;
      const identity = await auth(request);

      // --- PUBLIC ENDPOINTS ---
      if (method === 'GET' && path === '/config') {
        return json(200, { config: await store.getConfig() });
      }
      if (method === 'GET' && path === '/notes') {
        return json(200, { notes: await store.listNotes() });
      }
      if (method === 'GET' && path === '/moments') {
        return json(200, { moments: await store.listMoments() });
      }
      if (method === 'GET' && path === '/timeline') {
        return json(200, { timeline: await store.listTimeline() });
      }
      if (method === 'GET' && path === '/photo-wall') {
        return json(200, { photos: await store.listPhotoWall() });
      }

      // --- AUTH ENDPOINTS ---
      if (method === 'POST' && path === '/auth/admin/login') {
        const ok = await verifySecret(body.password ?? '', adminPasswordHash);
        if (!ok) return json(403, { error: '密码错误' });
        return json(200, { role: 'admin', token: await signToken({ role: 'admin' }, tokenSecret) });
      }

      if (method === 'POST' && path === '/auth/invite/claim') {
        const code = String(body.code ?? '').trim();
        const codeHash = hashCode(code, tokenSecret);
        
        const invites = await store.listInvites();
        const invite = invites.find(inv => inv.codeHash === codeHash);
        if (!invite) return json(403, { error: '无效的邀请码' });
        
        if (invite.status === 'revoked') {
          return json(403, { error: '该邀请码已被废弃' });
        }
        
        if (invite.status === 'used') {
          // 如果已被使用，且绑定的编辑者仍然处于激活状态，则允许重新登录
          let editor = null;
          if (invite.editorId) {
            editor = await store.getEditor(invite.editorId);
          }
          
          // 如果通过 editorId 没有找到，或者是历史遗留数据，通过 displayName 寻找激活状态的编辑者
          if (!editor) {
            const editors = await store.listEditors();
            editor = editors.find(ed => ed.displayName === invite.displayName && ed.status === 'active');
            if (editor) {
              // 自动补写绑定关系
              await store.updateInvite(invite.id, { editorId: editor.id });
            }
          }
          
          // 如果数据库中不存在该编辑者，重新创建一个并绑定，确保用户绝不被锁在外
          if (!editor) {
            editor = { 
              id: randomId('ed'), 
              displayName: invite.displayName, 
              status: 'active', 
              createdAt: now() 
            };
            await store.createEditor(editor);
            await store.updateInvite(invite.id, { editorId: editor.id });
          }

          if (editor.status !== 'active') {
            return json(403, { error: '该邀请码绑定的编辑者权限已被撤销' });
          }

          return json(200, {
            role: 'editor',
            displayName: editor.displayName,
            token: await signToken({ role: 'editor', editorId: editor.id }, tokenSecret)
          });
        }
        
        // 首次认领并激活编辑者身份
        const editor = { 
          id: randomId('ed'), 
          displayName: invite.displayName, 
          status: 'active', 
          createdAt: now() 
        };
        await store.createEditor(editor);
        await store.updateInvite(invite.id, { status: 'used', usedAt: now(), editorId: editor.id });
        
        return json(200, {
          role: 'editor',
          displayName: editor.displayName,
          token: await signToken({ role: 'editor', editorId: editor.id }, tokenSecret)
        });
      }

      if (method === 'GET' && path === '/auth/me') {
        return identity ? json(200, identity) : json(401, { error: '未登录' });
      }

      // --- EDITOR ENDPOINTS ---
      if (method === 'POST' && path === '/notes') {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const note = {
          id: randomId('note'),
          authorId: identity.editorId ?? 'admin',
          authorName: identity.displayName ?? '管理员',
          text: String(body.text ?? '').trim().slice(0, 200),
          color: String(body.color ?? 'yellow'),
          createdAt: now(),
          updatedAt: now()
        };
        return json(201, { note: await store.createNote(note) });
      }

      if (method === 'DELETE' && path.startsWith('/notes/')) {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const id = path.slice(7);
        // 先获取留言查看是谁创建的
        const notesList = await store.listNotes();
        const note = notesList.find(n => n.id === id || String(n.id) === id);
        if (!note) return json(404, { error: '留言不存在' });

        if (identity.role !== 'admin' && note.authorId !== identity.editorId) {
          return json(403, { error: '您只能删除自己创建的留言' });
        }
        
        await store.deleteNote(note.id);
        return json(200, { success: true });
      }

      if (method === 'POST' && path === '/uploads/photos') {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        if (!photoStorage) {
          return json(500, { error: '照片存储不可用' });
        }
        const saved = await photoStorage.savePhoto({
          filename: String(body.filename ?? 'photo.jpg'),
          dataUrl: String(body.dataUrl ?? '')
        });
        return json(201, { photo: saved });
      }

      if (method === 'POST' && path === '/moments') {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const moment = {
          id: randomId('moment'),
          authorId: identity.editorId ?? 'admin',
          authorName: identity.displayName ?? '管理员',
          icon: String(body.icon ?? '🌸'),
          tag: String(body.tag ?? '日常'),
          content: String(body.content ?? '').trim().slice(0, 120),
          date: String(body.date ?? '').slice(0, 10),
          images: Array.isArray(body.images) ? body.images.slice(0, 9) : [],
          createdAt: now(),
          updatedAt: now()
        };
        return json(201, { moment: await store.createMoment(moment) });
      }

      if (method === 'PATCH' && path.startsWith('/moments/')) {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const id = path.slice(9);
        const momentsList = await store.listMoments();
        const m = momentsList.find(item => item.id === id || String(item.id) === id);
        if (!m) return json(404, { error: '瞬间不存在' });

        if (identity.role !== 'admin' && m.authorId !== identity.editorId) {
          return json(403, { error: '您只能修改自己创建的瞬间' });
        }

        const patch = {
          icon: String(body.icon ?? m.icon),
          tag: String(body.tag ?? m.tag),
          content: String(body.content ?? m.content).trim().slice(0, 120),
          date: String(body.date ?? m.date).slice(0, 10),
          images: Array.isArray(body.images) ? body.images.slice(0, 9) : m.images,
          updatedAt: now()
        };

        const updated = await store.updateMoment(m.id, patch);
        return json(200, { moment: updated });
      }

      if (method === 'DELETE' && path.startsWith('/moments/')) {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const id = path.slice(9);
        const momentsList = await store.listMoments();
        const m = momentsList.find(item => item.id === id || String(item.id) === id);
        if (!m) return json(404, { error: '瞬间不存在' });

        if (identity.role !== 'admin' && m.authorId !== identity.editorId) {
          return json(403, { error: '您只能删除自己创建的瞬间' });
        }

        await store.deleteMoment(m.id);
        return json(200, { success: true });
      }

      if (method === 'POST' && path === '/timeline') {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const item = {
          id: randomId('timeline'),
          authorId: identity.editorId ?? 'admin',
          authorName: identity.displayName ?? '管理员',
          category: String(body.category ?? 'daily'),
          date: String(body.date ?? '').slice(0, 10),
          title: String(body.title ?? '').trim().slice(0, 40),
          content: String(body.content ?? '').trim().slice(0, 500),
          photos: Array.isArray(body.photos) ? body.photos : [],
          createdAt: now(),
          updatedAt: now()
        };
        return json(201, { timeline: await store.createTimeline(item) });
      }

      if (method === 'PATCH' && path.startsWith('/timeline/')) {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const id = path.slice(10);
        const timelineList = await store.listTimeline();
        const item = timelineList.find(t => t.id === id || String(t.id) === id);
        if (!item) return json(404, { error: '时刻不存在' });

        if (identity.role !== 'admin' && item.authorId !== identity.editorId) {
          return json(403, { error: '您只能修改自己创建的时刻' });
        }

        const patch = {
          category: String(body.category ?? item.category),
          date: String(body.date ?? item.date).slice(0, 10),
          title: String(body.title ?? item.title).trim().slice(0, 40),
          content: String(body.content ?? item.content).trim().slice(0, 500),
          photos: Array.isArray(body.photos) ? body.photos : item.photos,
          updatedAt: now()
        };

        const updated = await store.updateTimeline(item.id, patch);
        return json(200, { timeline: updated });
      }

      if (method === 'DELETE' && path.startsWith('/timeline/')) {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const id = path.slice(10);
        const timelineList = await store.listTimeline();
        const item = timelineList.find(t => t.id === id || String(t.id) === id);
        if (!item) return json(404, { error: '时刻不存在' });

        if (identity.role !== 'admin' && item.authorId !== identity.editorId) {
          return json(403, { error: '您只能删除自己创建的时刻' });
        }

        await store.deleteTimeline(item.id);
        return json(200, { success: true });
      }

      if (method === 'POST' && path === '/photo-wall') {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const photo = {
          id: randomId('photo'),
          authorId: identity.editorId ?? 'admin',
          authorName: identity.displayName ?? '管理员',
          title: String(body.title ?? '').trim().slice(0, 40) || '我们的照片',
          src: String(body.src ?? '').trim(),
          date: String(body.date ?? '').slice(0, 10),
          desc: String(body.desc ?? '').trim().slice(0, 300),
          ratio: String(body.ratio ?? '').trim().slice(0, 12),
          createdAt: now(),
          updatedAt: now()
        };
        return json(201, { photo: await store.createPhotoWallPhoto(photo) });
      }

      if (method === 'PATCH' && path.startsWith('/photo-wall/')) {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const id = path.slice(12);
        const photos = await store.listPhotoWall();
        const photo = photos.find(item => item.id === id || String(item.id) === id);
        if (!photo) return json(404, { error: '照片不存在' });

        if (identity.role !== 'admin' && photo.authorId !== identity.editorId) {
          return json(403, { error: '您只能修改自己创建的照片' });
        }

        const patch = {
          title: String(body.title ?? photo.title).trim().slice(0, 40) || photo.title,
          src: String(body.src ?? photo.src).trim(),
          date: String(body.date ?? photo.date).slice(0, 10),
          desc: String(body.desc ?? photo.desc ?? '').trim().slice(0, 300),
          ratio: String(body.ratio ?? photo.ratio ?? '').trim().slice(0, 12),
          updatedAt: now()
        };

        const updated = await store.updatePhotoWallPhoto(photo.id, patch);
        return json(200, { photo: updated });
      }

      if (method === 'DELETE' && path.startsWith('/photo-wall/')) {
        if (!requireEditor(identity)) return json(401, { error: '需要编辑者权限' });
        const id = path.slice(12);
        const photos = await store.listPhotoWall();
        const photo = photos.find(item => item.id === id || String(item.id) === id);
        if (!photo) return json(404, { error: '照片不存在' });

        if (identity.role !== 'admin' && photo.authorId !== identity.editorId) {
          return json(403, { error: '您只能删除自己创建的照片' });
        }

        await store.deletePhotoWallPhoto(photo.id);
        return json(200, { success: true });
      }

      // --- ADMIN ONLY ENDPOINTS ---
      if (method === 'PATCH' && path === '/config') {
        if (!identity || identity.role !== 'admin') {
          return json(401, { error: '需要管理员权限' });
        }
        const patch = {
          partnerName: String(body.partnerName ?? '').trim().slice(0, 12),
          anniversaryDate: String(body.anniversaryDate ?? '').slice(0, 10),
          bgMusic: String(body.bgMusic ?? ''),
          updatedAt: now()
        };
        const updated = await store.updateConfig(patch);
        return json(200, { config: updated });
      }

      if (method === 'POST' && path === '/admin/invites') {
        if (!identity || identity.role !== 'admin') {
          return json(401, { error: '需要管理员权限' });
        }
        const code = randomCode();
        const invite = {
          id: randomId('inv'),
          codeHash: hashCode(code, tokenSecret),
          code,
          displayName: String(body.displayName ?? '').trim().slice(0, 10) || '编辑者',
          status: 'unused',
          createdAt: now()
        };
        await store.createInvite(invite);
        return json(201, { ...invite, codeHash: undefined });
      }

      if (method === 'GET' && path === '/admin/invites') {
        if (!identity || identity.role !== 'admin') {
          return json(401, { error: '需要管理员权限' });
        }
        return json(200, { invites: await store.listInvites() });
      }

      if (method === 'POST' && path.startsWith('/admin/invites/') && path.endsWith('/revoke')) {
        if (!identity || identity.role !== 'admin') {
          return json(401, { error: '需要管理员权限' });
        }
        const parts = path.split('/');
        const id = parts[3];
        const updated = await store.updateInvite(id, { status: 'revoked', revokedAt: now() });
        if (!updated) return json(404, { error: '未找到该邀请码' });
        return json(200, { invite: updated });
      }

      if (method === 'GET' && path === '/admin/editors') {
        if (!identity || identity.role !== 'admin') {
          return json(401, { error: '需要管理员权限' });
        }
        return json(200, { editors: await store.listEditors() });
      }

      if (method === 'POST' && path.startsWith('/admin/editors/') && path.endsWith('/revoke')) {
        if (!identity || identity.role !== 'admin') {
          return json(401, { error: '需要管理员权限' });
        }
        const parts = path.split('/');
        const id = parts[3];
        const updated = await store.revokeEditor(id, now());
        if (!updated) return json(404, { error: '未找到该编辑者' });
        return json(200, { editor: updated });
      }

      // Pre-flight fallback or fallback 404
      if (method === 'OPTIONS') {
        return json(204, {});
      }

      return json(404, { error: '接口未找到' });
    }
  };
}
