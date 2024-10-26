"use server";

import { db } from "@/db";
import { ShirtColor, ShirtModel, ShirtSide } from "@prisma/client";

export type CreateConfigArgs = {
  color: ShirtColor; // Màu sắc áo
  model: ShirtModel; // Mẫu áo
  imageUrls: {      // Danh sách các URL hình ảnh cho ConfigurationImage
    url: string;
    width: number;
    height: number;
    side: ShirtSide; // Thêm trường side để xác định mặt áo
  }[];
  croppedImages: {  // Danh sách các hình ảnh đã cắt
    side: ShirtSide; // Mặt áo: front, back, left, right
    url: string;     // URL của hình ảnh cắt
  }[];
}


export async function createConfig({
  color,
  model,
  imageUrls,
  croppedImages, // Thay đổi từ croppedImageUrl thành croppedImages
}: CreateConfigArgs): Promise<string> {
  const config = await db.configuration.create({
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
          side: croppedImage.side, // Đảm bảo có trường side cho từng hình ảnh cắt
          url: croppedImage.url,
        })),
      },
    },
  });

  return config.id;
}

