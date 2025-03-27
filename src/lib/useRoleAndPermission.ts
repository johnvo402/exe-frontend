import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const server = getKindeServerSession();

export const checkRole = async (role: string) => {
  const token = await server.getAccessToken();
  const roles = token?.roles?.map((r: { key: string }) => r.key);
  if (!roles) {
    return false;
  }
  return roles.includes(role);
};
