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

describe('API handlers', () => {
  test('blocks note creation for visitors', async () => {
    const app = createHandlers({ store: createMemoryStore(), tokenSecret: 'secret', adminPasswordHash: await hashSecret('admin-pass') });

    const response = await call(app, 'POST', '/notes', { authorName: 'A', text: 'hi', color: 'pink' });

    expect(response.status).toBe(401);
  });

  test('admin creates invite and editor claims it once', async () => {
    const app = createHandlers({ store: createMemoryStore(), tokenSecret: 'secret', adminPasswordHash: await hashSecret('admin-pass') });

    const login = await call(app, 'POST', '/auth/admin/login', { password: 'admin-pass' });
    const invite = await call(app, 'POST', '/admin/invites', { displayName: '珊珊' }, login.body.token);
    const claim = await call(app, 'POST', '/auth/invite/claim', { code: invite.body.code });
    const secondClaim = await call(app, 'POST', '/auth/invite/claim', { code: invite.body.code });

    expect(invite.status).toBe(201);
    expect(claim.status).toBe(200);
    expect(claim.body.role).toBe('editor');
    expect(secondClaim.status).toBe(200);

    const me = await call(app, 'GET', '/auth/me', null, claim.body.token);
    const editorId = me.body.editorId;
    await call(app, 'POST', `/admin/editors/${editorId}/revoke`, {}, login.body.token);
    const thirdClaim = await call(app, 'POST', '/auth/invite/claim', { code: invite.body.code });
    expect(thirdClaim.status).toBe(403);
  });

  test('editor creates a note after claiming invite', async () => {
    const app = createHandlers({ store: createMemoryStore(), tokenSecret: 'secret', adminPasswordHash: await hashSecret('admin-pass') });

    const login = await call(app, 'POST', '/auth/admin/login', { password: 'admin-pass' });
    const invite = await call(app, 'POST', '/admin/invites', { displayName: '珊珊' }, login.body.token);
    const claim = await call(app, 'POST', '/auth/invite/claim', { code: invite.body.code });
    const created = await call(app, 'POST', '/notes', { text: '一起去旅行', color: 'blue' }, claim.body.token);
    const listed = await call(app, 'GET', '/notes');

    expect(created.status).toBe(201);
    expect(listed.body.notes[0].text).toBe('一起去旅行');
    expect(listed.body.notes[0].authorName).toBe('珊珊');
  });

  test('admin can update config', async () => {
    const app = createHandlers({ store: createMemoryStore(), tokenSecret: 'secret', adminPasswordHash: await hashSecret('admin-pass') });
    const login = await call(app, 'POST', '/auth/admin/login', { password: 'admin-pass' });

    const configUpdate = await call(app, 'PATCH', '/config', { partnerName: '胡珊珊宝贝', anniversaryDate: '2024-06-28' }, login.body.token);
    const configGet = await call(app, 'GET', '/config');

    expect(configUpdate.status).toBe(200);
    expect(configGet.body.config.partnerName).toBe('胡珊珊宝贝');
    expect(configGet.body.config.anniversaryDate).toBe('2024-06-28');
  });
});
