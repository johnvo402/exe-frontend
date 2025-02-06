'use server';

import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products';
import { db } from '@/db';
import { payos } from '@/lib/payos';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { CheckoutRequestType } from '@payos/node/lib/type';
import { Order, ShippingAddress } from '@prisma/client';
export const createPayment = async (
  body: CheckoutRequestType,
): Promise<CheckoutResponseDataType> => {
  body.returnUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? '';
  body.cancelUrl =
    `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?configId=` +
    body.description;
  const paymentLinkRes = await payos.createPaymentLink(body);

  return paymentLinkRes;
};
export type CreateOrder = {
  configId: string;
  address: string;
  name: string;
  email: string;
  phoneNumber: string;
  amount: number;
};
export const createOrder = async ({
  configId,
  address,
  name,
  email,
  phoneNumber,
  amount,
}: CreateOrder) => {
  // Fetch the configuration by ID
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  if (!configuration) {
    throw new Error('No such configuration found');
  }

  // Retrieve the current user from the session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error('You need to be logged in');
  }

  // Determine the price (you can extend this logic if PRODUCT_PRICES are relevant)

  let order: Order | undefined = undefined;

  // Check if the user already has an order for this configuration
  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      configurationId: configuration.id,
    },
  });

  if (existingOrder) {
    order = existingOrder;
  } else {
    // Create a new order if no existing one is found
    order = await db.order.create({
      data: {
        amount, // Ensure the amount is in the correct format (e.g., dollars instead of cents)
        userId: user.id,
        configurationId: configuration.id,
        shippingAddress: {
          create: {
            address,
            name,
            email,
            phoneNumber,
          },
        },
      },
    });
  }

  // Optionally, you can return order information or a URL
  return { success: true };
};
