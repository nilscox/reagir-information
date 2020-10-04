const enviornmentVariables = [

  // Env

  'NODE_ENV',
  'CI',

  'LISTEN_IP',
  'LISTEN_PORT',

  'REFLECT_ORIGIN',
  'BYPASS_AUTHORIZATIONS',

  'SSL_CERTIFICATE',
  'SSL_CERTIFICATE_KEY',

  'APP_URL',
  'WEBSITE_URL',

  // Database

  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',

  'DB_ENTITIES',
  'DB_MIGRATIONS',
  'DB_SEEDS',

  'DB_DEBUG',

  // Email

  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_BYPASS',
  'EMAIL_ACCOUNT_VERIFICATION',

  // Session

  'SESSION_SECRET',
  'SECURE_COOKIE',

  // Paths

  'USER_AVATAR_DESTINATION',

] as const;

export type EnviornmentVariable = typeof enviornmentVariables[number];

export const env = enviornmentVariables.reduce(
  (obj, key) => ({ ...obj, [key]: process.env[key] }),
  {} as { [key in EnviornmentVariable]: string },
);
