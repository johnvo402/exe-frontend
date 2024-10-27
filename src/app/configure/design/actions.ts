'use server';

import { db } from '@/db';
import { ShirtColor, ShirtModel, ShirtSide } from '@prisma/client';

export type CreateConfigArgs = {
  color: ShirtColor; // Shirt color
  model: ShirtModel; // Shirt model
  imageUrls: {
    url: string; // Image URL
    width: number; // Image width
    height: number; // Image height
    side: ShirtSide; // Shirt side
  }[];
  croppedImages: {
    side: ShirtSide; // Cropped side
    url: string; // Cropped image URL
  }[];
};

export async function createConfig({
  color,
  model,
  imageUrls,
  croppedImages,
}: CreateConfigArgs): Promise<string> {
  // Validate input data
  if (!croppedImages.length) {
    throw new Error('Image URLs and cropped images cannot be empty.');
  }

  // Begin transaction to ensure data integrity
  const config = await db.$transaction(async (prisma) => {
    const createdConfig = await prisma.configuration.create({
      data: {
        color,
        model,
        ConfigurationImage: {
          create: imageUrls.map((image) => ({
            side: image.side,
            imageUrl: {
              create: {
                url: image.url,
                width: image.width,
                height: image.height,
              },
            },
          })),
        },
        croppedImages: {
          create: croppedImages.map((croppedImage) => ({
            side: croppedImage.side,
            url: croppedImage.url,
          })),
        },
      },
    });

    return createdConfig;
  });

  return config.id; // Return the ID of the created configuration
}
