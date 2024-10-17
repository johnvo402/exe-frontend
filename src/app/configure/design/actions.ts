"use server";

import { db } from "@/db";
import { ShirtColor, ShirtModel } from "@prisma/client";

export type CreateConfigArgs = {
  color: ShirtColor;
  model: ShirtModel;
  croppedImageUrl: string;
  imageUrls: Array<{
    url: string;
    height: number;
    width: number;
  }>;
};

export async function createConfig({
  color,
  model,
  imageUrls,
  croppedImageUrl,
}: CreateConfigArgs): Promise<string> {
  const config = await db.configuration.create({
    data: {
      color,
      model,
      croppedImageUrl,
      ConfigurationImage: {
        create: imageUrls.map((image) => ({
          imageUrl: {
            create: {
              url: image.url,
              width: image.width,
              height: image.height,
            },
          },
        })),
      },
    },
  });

  return config.id;
}
