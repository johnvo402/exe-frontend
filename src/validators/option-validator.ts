// bg-zinc-50 border-zinc-50
// bg-zinc-900 border-zinc-900
// bg-rose-700 border-rose-700
// bg-sky-500 border-sky-500
// bg-emerald-950 border-emerald-950
// bg-amber-400 border-amber-400

import { PRODUCT_PRICES } from '@/config/products';
const tailwindColors: Record<string, string> = {
  'zinc-50': '#f9fafb',
  'zinc-900': '#1a202c',
  'rose-700': '#b91c1c',
  'sky-500': '#3b82f6',
  'emerald-950': '#047857',
  'amber-400': '#d97706',
  // Thêm các màu khác nếu cần
};

export function getTailwindColor(twClass: string): string {
  return tailwindColors[twClass] || '#000000';
}
export const COLORS = [
  {
    label: 'White',
    value: 'white',
    tw: 'zinc-50',
  },
  { label: 'Black', value: 'black', tw: 'zinc-900' },
  { label: 'Red', value: 'red', tw: 'rose-700' },
  { label: 'Blue', value: 'blue', tw: 'sky-500' },
  { label: 'Green', value: 'green', tw: 'emerald-950' },
  { label: 'Yellow', value: 'yellow', tw: 'amber-400' },
] as const;

export const MODELS = {
  name: 'models',
  options: [
    {
      label: 'T-Shirt',
      value: 't_shirt',
    },
    {
      label: 'Polo Shirt',
      value: 'polo_shirt',
    },
  ],
} as const;
