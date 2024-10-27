import { createUploadthing, type FileRouter } from 'uploadthing/next';
// import { z } from 'zod';
// import sharp from 'sharp';
// import { db } from '@/db';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ file }) => {
      const url = file.url;
      return { url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
