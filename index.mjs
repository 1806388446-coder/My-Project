import { createHandlers } from './api/src/handlers.js';
import { loadConfig } from './api/src/config.js';
import { createMemoryStore } from './api/src/store.memory.js';
import { createTableStoreStore } from './api/src/store.tablestore.js';
import { createLocalPhotoStorage, createOSSPhotoStorage } from './api/src/storage.oss.js';

let cachedApp;

async function getApp() {
  if (cachedApp) return cachedApp;

  const config = await loadConfig();
  const store = config.useMemoryStore
    ? createMemoryStore()
    : createTableStoreStore({
        endpoint: config.tableStoreEndpoint,
        instancename: config.tableStoreInstance,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret
      });

  const photoStorage = config.useMemoryStore
    ? createLocalPhotoStorage()
    : createOSSPhotoStorage({
        region: config.ossRegion,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        bucket: config.photoBucket
      });

  cachedApp = createHandlers({
    store,
    tokenSecret: config.tokenSecret,
    adminPasswordHash: config.adminPasswordHash,
    photoStorage
  });
  return cachedApp;
}

function parseEvent(event) {
  if (typeof event === 'string') return JSON.parse(event);
  if (Buffer.isBuffer(event)) return JSON.parse(event.toString('utf8'));
  return event ?? {};
}

function parseBody(eventObj) {
  if (!eventObj.body) return {};
  const raw = eventObj.isBase64Encoded
    ? Buffer.from(eventObj.body, 'base64').toString('utf8')
    : eventObj.body;
  return raw ? JSON.parse(raw) : {};
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
};

export async function handler(event) {
  const eventObj = parseEvent(event);
  const method =
    eventObj.requestContext?.http?.method ??
    eventObj.httpMethod ??
    eventObj.method ??
    'GET';
  const path =
    eventObj.rawPath ??
    eventObj.path ??
    eventObj.requestContext?.http?.path ??
    '/';

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  let body = {};
  try {
    body = parseBody(eventObj);
  } catch {
    body = {};
  }

  const app = await getApp();
  const result = await app.handle({
    method,
    path,
    headers: eventObj.headers ?? {},
    body
  });

  return {
    statusCode: result.status,
    headers: {
      ...result.headers,
      ...corsHeaders
    },
    body: JSON.stringify(result.body),
    isBase64Encoded: false
  };
}
