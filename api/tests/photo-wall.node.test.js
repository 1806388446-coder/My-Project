import { describe, expect, test } from 'vitest';
import { createHandlers } from '../src/handlers.js';
import { createMemoryStore } from '../src/store.memory.js';
import { hashSecret } from '../src/security.js';

async function call(app, method, path, body, token) {
  return app.handle({
    method,
    path,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body
  });
}

async function claimEditor(app, adminToken, displayName) {
  const invite = await call(app, 'POST', '/admin/invites', { displayName }, adminToken);
  return call(app, 'POST', '/auth/invite/claim', { code: invite.body.code });
}

describe('photo wall API', () => {
  test('lists independent photo wall records publicly', async () => {
    const app = createHandlers({
      store: createMemoryStore({
        photoWall: [{
          id: 'photo-1',
          title: '夏夜晚风',
          src: 'assets/sunset_date.png',
          date: '2024-08-15',
          desc: '贴在墙上的一阵晚风',
          createdAt: '2024-08-15T00:00:00.000Z',
          updatedAt: '2024-08-15T00:00:00.000Z'
        }]
      }),
      tokenSecret: 'secret',
      adminPasswordHash: await hashSecret('admin-pass')
    });

    const response = await call(app, 'GET', '/photo-wall');

    expect(response.status).toBe(200);
    expect(response.body.photos.length).toBe(1);
    expect(response.body.photos[0].title).toBe('夏夜晚风');
  });

  test('requires editor permission and enforces ownership for mutations', async () => {
    const app = createHandlers({
      store: createMemoryStore(),
      tokenSecret: 'secret',
      adminPasswordHash: await hashSecret('admin-pass')
    });

    const visitorCreate = await call(app, 'POST', '/photo-wall', {
      title: '不能这样贴',
      src: 'assets/first_meet.jpg'
    });
    expect(visitorCreate.status).toBe(401);

    const adminLogin = await call(app, 'POST', '/auth/admin/login', { password: 'admin-pass' });
    const firstClaim = await claimEditor(app, adminLogin.body.token, '珊珊');
    const secondClaim = await claimEditor(app, adminLogin.body.token, '子杰');

    const created = await call(app, 'POST', '/photo-wall', {
      title: '公交车合影',
      src: 'assets/first_meet.jpg',
      date: '2024-06-27',
      desc: '第一次悄悄按下快门',
      ratio: '16 / 9'
    }, firstClaim.body.token);

    expect(created.status).toBe(201);
    expect(created.body.photo.authorName).toBe('珊珊');
    expect(created.body.photo.ratio).toBe('16 / 9');

    const blockedUpdate = await call(app, 'PATCH', `/photo-wall/${created.body.photo.id}`, {
      title: '别人不能改'
    }, secondClaim.body.token);
    expect(blockedUpdate.status).toBe(403);

    const updated = await call(app, 'PATCH', `/photo-wall/${created.body.photo.id}`, {
      title: '公交车上的第一张合影',
      desc: '把那天贴上墙',
      ratio: '3 / 4'
    }, firstClaim.body.token);
    expect(updated.status).toBe(200);
    expect(updated.body.photo.title).toBe('公交车上的第一张合影');
    expect(updated.body.photo.ratio).toBe('3 / 4');

    const blockedDelete = await call(app, 'DELETE', `/photo-wall/${created.body.photo.id}`, {}, secondClaim.body.token);
    expect(blockedDelete.status).toBe(403);

    const adminDelete = await call(app, 'DELETE', `/photo-wall/${created.body.photo.id}`, {}, adminLogin.body.token);
    expect(adminDelete.status).toBe(200);

    const listed = await call(app, 'GET', '/photo-wall');
    expect(listed.body.photos.length).toBe(0);
  });
});
