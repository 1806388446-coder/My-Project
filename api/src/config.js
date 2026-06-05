import { hashSecret } from './security.js';

export async function loadConfig(env = process.env) {
  const tokenSecret = env.TOKEN_SECRET ?? 'local-dev-token-secret';
  const adminPassword = env.ADMIN_PASSWORD ?? 'dzjdsb20040623';
  return {
    port: Number(env.PORT ?? 8787),
    tokenSecret,
    adminPasswordHash: env.ADMIN_PASSWORD_HASH ?? await hashSecret(adminPassword),
    useMemoryStore: env.USE_MEMORY_STORE !== 'false',
    accessKeyId: env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    ossRegion: env.OSS_REGION,
    photoBucket: env.PHOTO_BUCKET,
    tableStoreEndpoint: env.TABLESTORE_ENDPOINT,
    tableStoreInstance: env.TABLESTORE_INSTANCE
  };
}
