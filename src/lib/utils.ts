import { type ClassValue, clsx } from 'clsx';
import { Metadata } from 'next';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  return formatter.format(price);
};

export function constructMetadata({
  title = 'Osty - OwnStyle',
  description = 'Create custom high-quality shirts in seconds',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://osty.store',
  siteName = 'Osty Store',
  countryName = 'Vietnam',
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  url?: string;
  siteName?: string;
  countryName?: string;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      url,
      siteName,
      countryName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@ththu0402',
    },
    icons,
    metadataBase: new URL(
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://osty.store',
    ),
  };
}
