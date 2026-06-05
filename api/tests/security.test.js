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
