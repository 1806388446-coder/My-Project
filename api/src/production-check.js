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
