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
