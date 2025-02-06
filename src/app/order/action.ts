import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
const { getUser } = getKindeServerSession();
export async function getOrders() {
  const user = await getUser();
  if (!user?.id) {
    throw new Error('Invalid user data');
  }
  return await db.order.findMany({
    where: {
      userId: user.id,
    },
    include: {
      configuration: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
