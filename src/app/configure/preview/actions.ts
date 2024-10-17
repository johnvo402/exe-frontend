"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order } from "@prisma/client";

export const createOrder = async ({ configId }: { configId: string }) => {
  // Fetch the configuration by ID
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  if (!configuration) {
    throw new Error("No such configuration found");
  }

  // Retrieve the current user from the session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("You need to be logged in");
  }

  // Determine the price (you can extend this logic if PRODUCT_PRICES are relevant)
  let price = BASE_PRICE;

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
        amount: price / 100, // Ensure the amount is in the correct format (e.g., dollars instead of cents)
        userId: user.id,
        configurationId: configuration.id,
      },
    });
  }

  // Optionally, you can return order information or a URL
  return { url: "/" };
};
