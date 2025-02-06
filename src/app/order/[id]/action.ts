import { db } from '@/db';

export async function getOrder(id: string) {
  return await db.order.findUnique({
    where: { id },
    include: {
      configuration: {
        include: {
          croppedImages: true,
          ConfigurationImage: {
            include: {
              imageUrl: true,
            },
          },
        },
      },
      user: true,
      shippingAddress: true,
    },
  });
}
