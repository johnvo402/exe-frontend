'use server';

import { db } from '@/db';
import { OrderStatus } from '@prisma/client';

export const changeOrderStatus = async ({
  id,
  newStatus,
}: {
  id: string;
  newStatus: OrderStatus;
}) => {
  try {
    await db.order.update({
      where: { id },
      data: { status: newStatus },
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
};

export const getOrderData = async () => {
  const orders = await db.order.findMany({
    where: {},
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      shippingAddress: true,
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
    },
  });

  const lastWeekSum = await db.order.aggregate({
    where: {
      status: 'shipped',
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    _sum: {
      amount: true,
    },
  });

  const lastMonthSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
    _sum: {
      amount: true,
    },
  });

  return { orders, lastWeekSum, lastMonthSum };
};
