import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
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

    assert.equal(response.status, 200);
    assert.equal(response.body.photos.length, 1);
    assert.equal(response.body.photos[0].title, '夏夜晚风');
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
    assert.equal(visitorCreate.status, 401);

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

    assert.equal(created.status, 201);
    assert.equal(created.body.photo.authorName, '珊珊');
    assert.equal(created.body.photo.ratio, '16 / 9');

    const blockedUpdate = await call(app, 'PATCH', `/photo-wall/${created.body.photo.id}`, {
      title: '别人不能改'
    }, secondClaim.body.token);
    assert.equal(blockedUpdate.status, 403);

    const updated = await call(app, 'PATCH', `/photo-wall/${created.body.photo.id}`, {
      title: '公交车上的第一张合影',
      desc: '把那天贴上墙',
      ratio: '3 / 4'
    }, firstClaim.body.token);
    assert.equal(updated.status, 200);
    assert.equal(updated.body.photo.title, '公交车上的第一张合影');
    assert.equal(updated.body.photo.ratio, '3 / 4');

    const blockedDelete = await call(app, 'DELETE', `/photo-wall/${created.body.photo.id}`, {}, secondClaim.body.token);
    assert.equal(blockedDelete.status, 403);

    const adminDelete = await call(app, 'DELETE', `/photo-wall/${created.body.photo.id}`, {}, adminLogin.body.token);
    assert.equal(adminDelete.status, 200);

    const listed = await call(app, 'GET', '/photo-wall');
    assert.equal(listed.body.photos.length, 0);
  });
});
