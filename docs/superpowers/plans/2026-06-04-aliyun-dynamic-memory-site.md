# Aliyun Dynamic Memory Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current static memory website into an Alibaba Cloud backed dynamic site with shared notes, shared moments, photo uploads, admin-managed invite codes, and long-lived editor access.

**Architecture:** Keep the current static frontend hosted by OSS. Add a Node.js API for Alibaba Cloud Function Compute, backed by TableStore for structured records and OSS for uploaded photos. The frontend loads public content from the API and stores only an authorization token locally after admin or invite login.

**Tech Stack:** Plain HTML/CSS/JavaScript frontend, Node.js 20 API, Vitest tests, Alibaba Cloud Function Compute, OSS, TableStore.

---

## External Setup Checklist

These steps happen in the Alibaba Cloud console before production deployment.

- [ ] Create or confirm an Alibaba Cloud account with real-name verification.
- [ ] Create an OSS bucket for the website, preferably in China Hong Kong for faster launch without mainland ICP filing.
- [ ] Create an OSS bucket or prefix for uploaded photos.
- [ ] Create a TableStore instance and tables for `SiteConfig`, `Notes`, `Moments`, `Editors`, and `InviteCodes`.
- [ ] Create a Function Compute service and function for the API.
- [ ] Create a RAM role or access keys with the minimum permissions needed for OSS and TableStore.
- [ ] Choose an API domain. For first launch, use Function Compute's default domain; later map `api.<domain>`.
- [ ] Choose a website domain. For first launch, use OSS static website URL; later map `www.<domain>`.
- [ ] Configure budget alerts in Alibaba Cloud, for example 20 RMB and 50 RMB monthly alerts.

## File Structure

Create a small backend project and frontend support modules while keeping the existing visual code.

- Create: `package.json` - root scripts for tests and local API development.
- Create: `api/src/config.js` - reads environment variables and validates required cloud config.
- Create: `api/src/security.js` - password hashing, invite hashing, token signing, token verification.
- Create: `api/src/store.memory.js` - in-memory store used by tests and local development.
- Create: `api/src/storage.oss.js` - local photo storage helper for development; production OSS integration is documented after resource creation.
- Create: `api/src/production-check.js` - validates required Alibaba Cloud production environment variables.
- Create: `api/src/handlers.js` - request routing and API behavior.
- Create: `api/src/server.js` - local HTTP server and Function Compute entrypoint.
- Create: `api/tests/security.test.js` - auth and token behavior tests.
- Create: `api/tests/handlers.test.js` - API permission and CRUD tests.
- Create: `cloud-config.js` - runtime frontend API configuration.
- Create: `cloud-api.js` - frontend API client.
- Create: `cloud-auth.js` - frontend token persistence and auth helpers.
- Modify: `index.html` - load cloud scripts before `app.js` and add admin/edit controls.
- Modify: `app.js` - replace `localStorage` note/moment persistence with cloud API calls.
- Modify: `styles.css` - style edit mode, auth modal, and admin panel.
- Modify: `README_ALIYUN_DEPLOY.md` - document cloud deployment and domain setup.

---

### Task 1: Root Test Harness

**Files:**
- Create: `/Users/dengzijie/Documents/MyProject/package.json`
- Create: `/Users/dengzijie/Documents/MyProject/api/tests/security.test.js`

- [ ] **Step 1: Write the failing test**

Create `api/tests/security.test.js`:

```js
import { describe, expect, test } from 'vitest';
import { hashSecret, verifySecret, signToken, verifyToken } from '../src/security.js';

describe('security helpers', () => {
  test('hashes and verifies a secret without storing the plain text', async () => {
    const hash = await hashSecret('invite-123');

    expect(hash).not.toContain('invite-123');
    expect(await verifySecret('invite-123', hash)).toBe(true);
    expect(await verifySecret('wrong', hash)).toBe(false);
  });

  test('signs a long-lived token and verifies its payload', async () => {
    const token = await signToken({ role: 'editor', editorId: 'ed_1' }, 'test-secret');
    const payload = await verifyToken(token, 'test-secret');

    expect(payload.role).toBe('editor');
    expect(payload.editorId).toBe('ed_1');
  });
});
```

- [ ] **Step 2: Add test script**

Create `package.json`:

```json
{
  "name": "aliyun-dynamic-memory-site",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "api:dev": "node api/src/server.js"
  },
  "dependencies": {
    "@alicloud/oss": "^6.22.0",
    "tablestore": "^5.0.10"
  },
  "devDependencies": {
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules/` and `package-lock.json` are created.

- [ ] **Step 4: Run test to verify it fails**

Run:

```bash
npm test api/tests/security.test.js
```

Expected: FAIL because `api/src/security.js` does not exist.

---

### Task 2: Security Helpers

**Files:**
- Create: `/Users/dengzijie/Documents/MyProject/api/src/security.js`
- Test: `/Users/dengzijie/Documents/MyProject/api/tests/security.test.js`

- [ ] **Step 1: Implement minimal security helpers**

Create `api/src/security.js`:

```js
import crypto from 'node:crypto';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function fromBase64url(input) {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

export async function hashSecret(secret) {
  const salt = crypto.randomBytes(16).toString('hex');
  const digest = crypto.scryptSync(secret, salt, 64).toString('hex');
  return `scrypt:${salt}:${digest}`;
}

export async function verifySecret(secret, storedHash) {
  const [scheme, salt, digest] = storedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !digest) return false;
  const candidate = crypto.scryptSync(secret, salt, 64);
  const expected = Buffer.from(digest, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
}

export async function signToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyToken(token, secret) {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) throw new Error('Invalid token');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Invalid token signature');
  }
  return JSON.parse(fromBase64url(encodedPayload));
}
```

- [ ] **Step 2: Run security tests**

Run:

```bash
npm test api/tests/security.test.js
```

Expected: PASS.

---

### Task 3: In-Memory Store

**Files:**
- Create: `/Users/dengzijie/Documents/MyProject/api/src/store.memory.js`
- Create: `/Users/dengzijie/Documents/MyProject/api/tests/store.memory.test.js`

- [ ] **Step 1: Write failing store tests**

Create `api/tests/store.memory.test.js`:

```js
import { describe, expect, test } from 'vitest';
import { createMemoryStore } from '../src/store.memory.js';

describe('memory store', () => {
  test('creates notes and lists newest first', async () => {
    const store = createMemoryStore();

    await store.createNote({ id: 'n1', authorId: 'ed_1', authorName: 'A', text: 'first', color: 'pink', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    await store.createNote({ id: 'n2', authorId: 'ed_1', authorName: 'A', text: 'second', color: 'blue', createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' });

    const notes = await store.listNotes();

    expect(notes.map((note) => note.id)).toEqual(['n2', 'n1']);
  });

  test('revokes an editor', async () => {
    const store = createMemoryStore();
    await store.createEditor({ id: 'ed_1', displayName: '珊珊', status: 'active', createdAt: '2026-01-01T00:00:00.000Z' });

    await store.revokeEditor('ed_1', '2026-01-02T00:00:00.000Z');
    const editor = await store.getEditor('ed_1');

    expect(editor.status).toBe('revoked');
    expect(editor.revokedAt).toBe('2026-01-02T00:00:00.000Z');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test api/tests/store.memory.test.js
```

Expected: FAIL because `api/src/store.memory.js` does not exist.

- [ ] **Step 3: Implement memory store**

Create `api/src/store.memory.js`:

```js
export function createMemoryStore(seed = {}) {
  const config = seed.config ?? { id: 'main', partnerName: '胡珊珊', anniversaryDate: '2024-06-27', updatedAt: new Date(0).toISOString() };
  const notes = [...(seed.notes ?? [])];
  const moments = [...(seed.moments ?? [])];
  const editors = new Map((seed.editors ?? []).map((editor) => [editor.id, editor]));
  const inviteCodes = new Map((seed.inviteCodes ?? []).map((invite) => [invite.id, invite]));

  return {
    async getConfig() {
      return config;
    },
    async updateConfig(nextConfig) {
      Object.assign(config, nextConfig);
      return config;
    },
    async listNotes() {
      return [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async createNote(note) {
      notes.push(note);
      return note;
    },
    async updateNote(id, patch) {
      const note = notes.find((item) => item.id === id);
      if (!note) return null;
      Object.assign(note, patch);
      return note;
    },
    async deleteNote(id) {
      const index = notes.findIndex((item) => item.id === id);
      if (index === -1) return false;
      notes.splice(index, 1);
      return true;
    },
    async listMoments() {
      return [...moments].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    },
    async createMoment(moment) {
      moments.push(moment);
      return moment;
    },
    async updateMoment(id, patch) {
      const moment = moments.find((item) => item.id === id);
      if (!moment) return null;
      Object.assign(moment, patch);
      return moment;
    },
    async deleteMoment(id) {
      const index = moments.findIndex((item) => item.id === id);
      if (index === -1) return false;
      moments.splice(index, 1);
      return true;
    },
    async createEditor(editor) {
      editors.set(editor.id, editor);
      return editor;
    },
    async getEditor(id) {
      return editors.get(id) ?? null;
    },
    async listEditors() {
      return [...editors.values()];
    },
    async revokeEditor(id, revokedAt) {
      const editor = editors.get(id);
      if (!editor) return null;
      editor.status = 'revoked';
      editor.revokedAt = revokedAt;
      return editor;
    },
    async createInvite(invite) {
      inviteCodes.set(invite.id, invite);
      return invite;
    },
    async listInvites() {
      return [...inviteCodes.values()];
    },
    async findUnusedInviteByHash(codeHash) {
      return [...inviteCodes.values()].find((invite) => invite.codeHash === codeHash && invite.status === 'unused') ?? null;
    },
    async updateInvite(id, patch) {
      const invite = inviteCodes.get(id);
      if (!invite) return null;
      Object.assign(invite, patch);
      return invite;
    }
  };
}
```

- [ ] **Step 4: Run store tests**

Run:

```bash
npm test api/tests/store.memory.test.js
```

Expected: PASS.

---

### Task 4: API Handlers and Permissions

**Files:**
- Create: `/Users/dengzijie/Documents/MyProject/api/src/handlers.js`
- Create: `/Users/dengzijie/Documents/MyProject/api/tests/handlers.test.js`
- Modify: `/Users/dengzijie/Documents/MyProject/api/src/security.js`

- [ ] **Step 1: Write failing API tests**

Create `api/tests/handlers.test.js`:

```js
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
    expect(secondClaim.status).toBe(403);
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test api/tests/handlers.test.js
```

Expected: FAIL because `api/src/handlers.js` does not exist.

- [ ] **Step 3: Add deterministic invite hashing**

Modify `api/src/security.js` to export:

```js
export function hashCode(code, secret) {
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

export function randomCode() {
  return crypto.randomBytes(6).toString('base64url').toUpperCase();
}

export function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}
```

- [ ] **Step 4: Implement handlers**

Create `api/src/handlers.js`:

```js
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

export function createHandlers({ store, tokenSecret, adminPasswordHash }) {
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

      if (method === 'GET' && path === '/config') return json(200, { config: await store.getConfig() });
      if (method === 'GET' && path === '/notes') return json(200, { notes: await store.listNotes() });
      if (method === 'GET' && path === '/moments') return json(200, { moments: await store.listMoments() });

      if (method === 'POST' && path === '/auth/admin/login') {
        const ok = await verifySecret(body.password ?? '', adminPasswordHash);
        if (!ok) return json(403, { error: 'Invalid password' });
        return json(200, { role: 'admin', token: await signToken({ role: 'admin' }, tokenSecret) });
      }

      if (method === 'POST' && path === '/admin/invites') {
        if (!identity || identity.role !== 'admin') return json(401, { error: 'Admin required' });
        const code = randomCode();
        const invite = {
          id: randomId('inv'),
          codeHash: hashCode(code, tokenSecret),
          displayName: String(body.displayName ?? '').trim(),
          status: 'unused',
          createdAt: now()
        };
        await store.createInvite(invite);
        return json(201, { ...invite, code, codeHash: undefined });
      }

      if (method === 'POST' && path === '/auth/invite/claim') {
        const codeHash = hashCode(String(body.code ?? ''), tokenSecret);
        const invite = await store.findUnusedInviteByHash(codeHash);
        if (!invite) return json(403, { error: 'Invalid invite code' });
        const editor = { id: randomId('ed'), displayName: invite.displayName, status: 'active', createdAt: now() };
        await store.createEditor(editor);
        await store.updateInvite(invite.id, { status: 'used', usedAt: now(), editorId: editor.id });
        return json(200, {
          role: 'editor',
          displayName: editor.displayName,
          token: await signToken({ role: 'editor', editorId: editor.id }, tokenSecret)
        });
      }

      if (method === 'GET' && path === '/auth/me') {
        return identity ? json(200, identity) : json(401, { error: 'Not signed in' });
      }

      if (method === 'POST' && path === '/notes') {
        if (!requireEditor(identity)) return json(401, { error: 'Editor required' });
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

      return json(404, { error: 'Not found' });
    }
  };
}
```

- [ ] **Step 5: Run handler tests**

Run:

```bash
npm test api/tests/handlers.test.js
```

Expected: PASS.

---

### Task 5: Local API Server

**Files:**
- Create: `/Users/dengzijie/Documents/MyProject/api/src/config.js`
- Create: `/Users/dengzijie/Documents/MyProject/api/src/server.js`

- [ ] **Step 1: Create config reader**

Create `api/src/config.js`:

```js
import { hashSecret } from './security.js';

export async function loadConfig(env = process.env) {
  const tokenSecret = env.TOKEN_SECRET ?? 'local-dev-token-secret';
  const adminPassword = env.ADMIN_PASSWORD ?? 'change-me-admin';
  return {
    port: Number(env.PORT ?? 8787),
    tokenSecret,
    adminPasswordHash: env.ADMIN_PASSWORD_HASH ?? await hashSecret(adminPassword),
    useMemoryStore: env.USE_MEMORY_STORE !== 'false'
  };
}
```

- [ ] **Step 2: Create local server**

Create `api/src/server.js`:

```js
import http from 'node:http';
import { createHandlers } from './handlers.js';
import { loadConfig } from './config.js';
import { createMemoryStore } from './store.memory.js';

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export async function createLocalServer() {
  const config = await loadConfig();
  const app = createHandlers({
    store: createMemoryStore(),
    tokenSecret: config.tokenSecret,
    adminPasswordHash: config.adminPasswordHash
  });

  return http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const result = await app.handle({
      method: request.method,
      path: url.pathname,
      headers: request.headers,
      body: await readBody(request)
    });
    response.writeHead(result.status, {
      ...result.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    });
    response.end(JSON.stringify(result.body));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = await loadConfig();
  const server = await createLocalServer();
  server.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}
```

- [ ] **Step 3: Run tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Start local API**

Run:

```bash
ADMIN_PASSWORD=admin-pass npm run api:dev
```

Expected: Console prints `API listening on http://localhost:8787`.

---

### Task 6: Frontend Cloud API Client

**Files:**
- Create: `/Users/dengzijie/Documents/MyProject/cloud-config.js`
- Create: `/Users/dengzijie/Documents/MyProject/cloud-auth.js`
- Create: `/Users/dengzijie/Documents/MyProject/cloud-api.js`
- Modify: `/Users/dengzijie/Documents/MyProject/index.html`

- [ ] **Step 1: Create frontend runtime config**

Create `cloud-config.js`:

```js
window.MEMORY_CLOUD_CONFIG = {
  apiBaseUrl: 'http://localhost:8787'
};
```

- [ ] **Step 2: Create auth token helpers**

Create `cloud-auth.js`:

```js
(function () {
  const TOKEN_KEY = 'memoryCloudToken';

  window.MemoryCloudAuth = {
    getToken() {
      return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token) {
      localStorage.setItem(TOKEN_KEY, token);
    },
    clearToken() {
      localStorage.removeItem(TOKEN_KEY);
    }
  };
})();
```

- [ ] **Step 3: Create API client**

Create `cloud-api.js`:

```js
(function () {
  const config = window.MEMORY_CLOUD_CONFIG || {};
  const apiBaseUrl = config.apiBaseUrl || '';

  async function request(path, options = {}) {
    const token = window.MemoryCloudAuth.getToken();
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const body = await response.json();
    if (!response.ok) {
      const error = new Error(body.error || '请求失败');
      error.status = response.status;
      throw error;
    }
    return body;
  }

  window.MemoryCloudApi = {
    getConfig: () => request('/config'),
    getNotes: () => request('/notes'),
    getMoments: () => request('/moments'),
    adminLogin: (password) => request('/auth/admin/login', { method: 'POST', body: { password } }),
    claimInvite: (code) => request('/auth/invite/claim', { method: 'POST', body: { code } }),
    me: () => request('/auth/me'),
    createInvite: (displayName) => request('/admin/invites', { method: 'POST', body: { displayName } }),
    createNote: (note) => request('/notes', { method: 'POST', body: note })
  };
})();
```

- [ ] **Step 4: Load scripts in HTML**

Modify `index.html` near the bottom before `app.js`:

```html
    <script src="cloud-config.js"></script>
    <script src="cloud-auth.js"></script>
    <script src="cloud-api.js"></script>
    <script src="app.js"></script>
```

Expected: `cloud-config.js`, `cloud-auth.js`, and `cloud-api.js` load before the existing app.

---

### Task 7: Frontend Auth UI

**Files:**
- Modify: `/Users/dengzijie/Documents/MyProject/index.html`
- Modify: `/Users/dengzijie/Documents/MyProject/styles.css`
- Modify: `/Users/dengzijie/Documents/MyProject/app.js`

- [ ] **Step 1: Add auth controls to HTML**

Add inside `.nav-actions` in `index.html`:

```html
            <button id="editModeBtn" class="icon-btn" title="进入编辑模式" aria-label="进入编辑模式">✎</button>
            <button id="logoutEditBtn" class="icon-btn hidden" title="退出编辑模式" aria-label="退出编辑模式">⎋</button>
```

Add before `</body>`:

```html
    <div id="authModal" class="modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-card zoom-in">
            <button id="closeAuthModal" class="close-btn" aria-label="关闭">&times;</button>
            <h3>进入编辑模式</h3>
            <form id="authForm" class="config-form">
                <div class="form-group">
                    <label for="authType">身份</label>
                    <select id="authType">
                        <option value="invite">编辑者邀请码</option>
                        <option value="admin">管理员密码</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="authSecret">密钥</label>
                    <input type="password" id="authSecret" required maxlength="80" autocomplete="current-password">
                </div>
                <button type="submit" class="submit-btn">确认进入</button>
            </form>
        </div>
    </div>
```

- [ ] **Step 2: Add edit mode styles**

Add to `styles.css`:

```css
.hidden {
    display: none !important;
}

body:not(.is-editor) .editor-only,
body:not(.is-admin) .admin-only {
    display: none !important;
}

.auth-status-pill {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
}
```

- [ ] **Step 3: Wire auth in app.js**

Inside `DOMContentLoaded`, after DOM element setup, add:

```js
    const editModeBtn = document.getElementById('editModeBtn');
    const logoutEditBtn = document.getElementById('logoutEditBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authForm = document.getElementById('authForm');
    const authType = document.getElementById('authType');
    const authSecret = document.getElementById('authSecret');
    let currentIdentity = null;

    function applyIdentity(identity) {
        currentIdentity = identity;
        body.classList.toggle('is-editor', !!identity && (identity.role === 'editor' || identity.role === 'admin'));
        body.classList.toggle('is-admin', !!identity && identity.role === 'admin');
        editModeBtn.classList.toggle('hidden', !!identity);
        logoutEditBtn.classList.toggle('hidden', !identity);
    }

    async function restoreIdentity() {
        if (!window.MemoryCloudAuth.getToken()) return;
        try {
            applyIdentity(await window.MemoryCloudApi.me());
        } catch {
            window.MemoryCloudAuth.clearToken();
            applyIdentity(null);
        }
    }

    editModeBtn.addEventListener('click', () => openModal(authModal));
    closeAuthModal.addEventListener('click', () => closeModal(authModal));
    logoutEditBtn.addEventListener('click', () => {
        window.MemoryCloudAuth.clearToken();
        applyIdentity(null);
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const secret = authSecret.value.trim();
        const result = authType.value === 'admin'
            ? await window.MemoryCloudApi.adminLogin(secret)
            : await window.MemoryCloudApi.claimInvite(secret);
        window.MemoryCloudAuth.setToken(result.token);
        applyIdentity(await window.MemoryCloudApi.me());
        authForm.reset();
        closeModal(authModal);
    });

    restoreIdentity();
```

Expected: A successful login persists the token and shows edit mode after refresh.

---

### Task 8: Replace Notes Persistence

**Files:**
- Modify: `/Users/dengzijie/Documents/MyProject/app.js`

- [ ] **Step 1: Stop initializing notes from localStorage**

Replace the current `let notes = JSON.parse(localStorage.getItem('memoryNotes')); ...` note initialization with:

```js
    let notes = [...defaultNotes];
```

- [ ] **Step 2: Add cloud note loader**

After `renderNotes()` is defined, add:

```js
    async function loadCloudNotes() {
        try {
            const result = await window.MemoryCloudApi.getNotes();
            notes = result.notes.length ? result.notes : defaultNotes;
            renderNotes();
        } catch (err) {
            console.warn('云端留言加载失败，使用默认留言:', err);
            notes = defaultNotes;
            renderNotes();
        }
    }
```

- [ ] **Step 3: Replace addNote implementation**

Replace `addNote(author, text, color)` with:

```js
    async function addNote(author, text, color) {
        const result = await window.MemoryCloudApi.createNote({ authorName: author, text, color });
        notes.unshift(result.note);
        renderNotes();
    }
```

- [ ] **Step 4: Update note form submit**

Where `addNote(author, text, selectedNoteColor);` is called, change it to:

```js
            await addNote(author, text, selectedNoteColor);
```

Change that event listener to `async`:

```js
    noteForm.addEventListener('submit', async (e) => {
```

- [ ] **Step 5: Load cloud notes on startup**

Near the existing startup render calls, call:

```js
    loadCloudNotes();
```

Expected: Local default notes show if API is down; cloud notes show if API is running.

---

### Task 9: Moments and Photo Upload API

**Files:**
- Create: `/Users/dengzijie/Documents/MyProject/api/src/storage.oss.js`
- Modify: `/Users/dengzijie/Documents/MyProject/api/src/handlers.js`
- Modify: `/Users/dengzijie/Documents/MyProject/cloud-api.js`
- Modify: `/Users/dengzijie/Documents/MyProject/app.js`

- [ ] **Step 1: Create placeholder OSS storage helper for local development**

Create `api/src/storage.oss.js`:

```js
export function createLocalPhotoStorage() {
  return {
    async savePhoto({ filename, dataUrl }) {
      return {
        key: `local/${Date.now()}-${filename}`,
        url: dataUrl,
        width: null,
        height: null,
        size: dataUrl.length
      };
    },
    async deletePhoto() {
      return true;
    }
  };
}
```

- [ ] **Step 2: Add cloud-api moment methods**

Add to `window.MemoryCloudApi` in `cloud-api.js`:

```js
    createMoment: (moment) => request('/moments', { method: 'POST', body: moment }),
    getMoments: () => request('/moments'),
    uploadPhoto: (photo) => request('/uploads/photos', { method: 'POST', body: photo })
```

- [ ] **Step 3: Add handlers for uploads and moments**

Extend `createHandlers` to accept `photoStorage`, then add routes:

```js
      if (method === 'POST' && path === '/uploads/photos') {
        if (!requireEditor(identity)) return json(401, { error: 'Editor required' });
        const saved = await photoStorage.savePhoto({
          filename: String(body.filename ?? 'photo.jpg'),
          dataUrl: String(body.dataUrl ?? '')
        });
        return json(201, { photo: saved });
      }

      if (method === 'POST' && path === '/moments') {
        if (!requireEditor(identity)) return json(401, { error: 'Editor required' });
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
```

- [ ] **Step 4: Wire local photo storage into server**

In `api/src/server.js`, import and pass local storage:

```js
import { createLocalPhotoStorage } from './storage.oss.js';
```

Then add to `createHandlers`:

```js
    photoStorage: createLocalPhotoStorage()
```

- [ ] **Step 5: Replace frontend moment save**

In `app.js`, before calling `addMoment`, upload the compressed images:

```js
                const uploadedImages = [];
                for (let i = 0; i < currentUploadedImages.length; i += 1) {
                    const photo = await window.MemoryCloudApi.uploadPhoto({
                        filename: `moment-${Date.now()}-${i}.jpg`,
                        dataUrl: currentUploadedImages[i]
                    });
                    uploadedImages.push(photo.photo);
                }
                const created = await window.MemoryCloudApi.createMoment({ icon, tag, content, date, images: uploadedImages });
                moments.unshift(created.moment);
                renderMoments();
```

Expected: Local development stores photo data URLs only in memory; production later swaps to real OSS storage.

---

### Task 10: Production Environment Configuration

**Files:**
- Modify: `/Users/dengzijie/Documents/MyProject/api/src/config.js`
- Create: `/Users/dengzijie/Documents/MyProject/api/src/production-check.js`
- Create: `/Users/dengzijie/Documents/MyProject/api/tests/production-check.test.js`

- [ ] **Step 1: Write failing production config tests**

Create `api/tests/production-check.test.js`:

```js
import { describe, expect, test } from 'vitest';
import { validateProductionEnv } from '../src/production-check.js';

describe('production env validation', () => {
  test('requires all Alibaba Cloud environment variables', () => {
    const result = validateProductionEnv({
      TOKEN_SECRET: 'token-secret',
      ADMIN_PASSWORD_HASH: 'hash',
      ALIBABA_CLOUD_ACCESS_KEY_ID: 'key-id',
      ALIBABA_CLOUD_ACCESS_KEY_SECRET: 'key-secret',
      OSS_REGION: 'oss-cn-hongkong',
      PHOTO_BUCKET: 'memory-photos',
      TABLESTORE_ENDPOINT: 'https://example.cn-hongkong.ots.aliyuncs.com',
      TABLESTORE_INSTANCE: 'memory-site'
    });

    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  test('reports missing variables clearly', () => {
    const result = validateProductionEnv({ TOKEN_SECRET: 'token-secret' });

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('ADMIN_PASSWORD_HASH');
    expect(result.missing).toContain('PHOTO_BUCKET');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test api/tests/production-check.test.js
```

Expected: FAIL because `api/src/production-check.js` does not exist.

- [ ] **Step 3: Implement production env validation**

Create `api/src/production-check.js`:

```js
const REQUIRED_PRODUCTION_ENV = [
  'TOKEN_SECRET',
  'ADMIN_PASSWORD_HASH',
  'ALIBABA_CLOUD_ACCESS_KEY_ID',
  'ALIBABA_CLOUD_ACCESS_KEY_SECRET',
  'OSS_REGION',
  'PHOTO_BUCKET',
  'TABLESTORE_ENDPOINT',
  'TABLESTORE_INSTANCE'
];

export function validateProductionEnv(env) {
  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => !env[name]);
  return {
    valid: missing.length === 0,
    missing
  };
}
```

- [ ] **Step 4: Extend config**

Add these fields in `loadConfig`:

```js
    accessKeyId: env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    ossRegion: env.OSS_REGION,
    photoBucket: env.PHOTO_BUCKET,
    tableStoreEndpoint: env.TABLESTORE_ENDPOINT,
    tableStoreInstance: env.TABLESTORE_INSTANCE
```

- [ ] **Step 5: Run production config tests**

Run:

```bash
npm test api/tests/production-check.test.js
```

Expected: PASS.

This task prepares the environment contract for Alibaba Cloud deployment. The concrete TableStore and OSS SDK adapters are implemented only after the actual Alibaba Cloud resource names and table schema are available.

---

### Task 11: Deployment Documentation

**Files:**
- Modify: `/Users/dengzijie/Documents/MyProject/README_ALIYUN_DEPLOY.md`

- [ ] **Step 1: Add dynamic deployment section**

Append:

```md
## 动态版部署顺序

1. 先在本地运行 `npm install` 和 `npm test`。
2. 本地运行 `ADMIN_PASSWORD=你的管理员密码 npm run api:dev`。
3. 打开页面，确认管理员登录、生成邀请码、邀请码登录、留言新增都能跑通。
4. 在阿里云创建 OSS、TableStore、函数计算 FC。
5. 把函数计算环境变量配置好：
   - `TOKEN_SECRET`
   - `ADMIN_PASSWORD_HASH`
   - `ALIBABA_CLOUD_ACCESS_KEY_ID`
   - `ALIBABA_CLOUD_ACCESS_KEY_SECRET`
   - `OSS_REGION`
   - `PHOTO_BUCKET`
   - `TABLESTORE_ENDPOINT`
   - `TABLESTORE_INSTANCE`
6. 部署函数计算 API。
7. 把 `cloud-config.js` 的 `apiBaseUrl` 改为函数计算 API 地址。
8. 上传前端文件到 OSS 静态网站 Bucket。
9. 用手机和电脑分别测试：访客查看、管理员登录、邀请码登录、留言、上传照片。
10. 绑定域名和 HTTPS。
```

- [ ] **Step 2: Document first admin password**

Append:

```md
## 管理员密码

管理员密码不要写入前端文件。生产环境应只放在函数计算环境变量中，或者先生成 `ADMIN_PASSWORD_HASH` 后放入环境变量。
```

Expected: The deployment README explains the exact production order.

---

## Self-Review Checklist

- [ ] Auth model covers visitor, editor, and admin roles.
- [ ] Invite code flow is one-time use and admin controlled.
- [ ] Editor token persists locally and can be cleared.
- [ ] Backend checks permissions for write operations.
- [ ] Notes move from localStorage to API.
- [ ] Moments and photos move toward API and OSS storage.
- [ ] Domain and HTTPS remain in deployment documentation.
- [ ] Production adapters are isolated from local tests.
