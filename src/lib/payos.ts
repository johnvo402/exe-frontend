import PayOS from '@payos/node';


function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export const payos = new PayOS(
  getEnvVariable('PAYOS_CLIENT_ID'),
  getEnvVariable('PAYOS_API_KEY'),
  getEnvVariable('PAYOS_CHECKSUM_KEY'),
);
