import http from 'node:http';
import { createHandlers } from './handlers.js';
import { loadConfig } from './config.js';
import { createMemoryStore } from './store.memory.js';
import { createTableStoreStore } from './store.tablestore.js';
import { createLocalPhotoStorage, createOSSPhotoStorage } from './storage.oss.js';

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export async function createLocalServer() {
  const config = await loadConfig();
  
  // 选择数据存储源
  let store;
  let photoStorage;
  if (config.useMemoryStore) {
    console.log('Using in-memory store and local photo simulation.');
    store = createMemoryStore();
    photoStorage = createLocalPhotoStorage();
  } else {
    console.log('Using production TableStore and OSS storage.');
    store = createTableStoreStore({
      endpoint: config.tableStoreEndpoint,
      instancename: config.tableStoreInstance,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret
    });
    photoStorage = createOSSPhotoStorage({
      region: config.ossRegion,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.photoBucket
    });
  }

  const app = createHandlers({
    store,
    tokenSecret: config.tokenSecret,
    adminPasswordHash: config.adminPasswordHash,
    photoStorage
  });

  return http.createServer(async (request, response) => {
    // 跨域预检
    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
      });
      response.end();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    let body = {};
    try {
      if (request.method === 'POST' || request.method === 'PATCH') {
        body = await readBody(request);
      }
    } catch (err) {
      console.warn('解析 JSON body 失败:', err);
    }

    const result = await app.handle({
      method: request.method,
      path: url.pathname,
      headers: request.headers,
      body
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

// 适配阿里云函数计算 FC (API 网关或 HTTP 触发器入口)
// FC Node.js 运行时支持直接导出一个 HTTP 服务器实例作为端口监听
// 或通过 handler 处理请求。对于 custom runtime，FC 会直接运行 node api/src/server.js 并监听 9000 或端口。
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server.js')) {
  const config = await loadConfig();
  const server = await createLocalServer();
  server.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}
