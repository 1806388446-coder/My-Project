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
  if (!storedHash) return false;
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

export function hashCode(code, secret) {
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

export function randomCode() {
  return crypto.randomBytes(6).toString('base64url').toUpperCase();
}

export function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}
