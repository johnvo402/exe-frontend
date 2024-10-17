// bg-zinc-50 border-zinc-50
// bg-zinc-900 border-zinc-900
// bg-rose-950 border-rose-950

import { PRODUCT_PRICES } from '@/config/products'

export const COLORS = [
  { label: 'Black', value: 'black', tw: 'zinc-900' },
  {
    label: 'White',
    value: 'white',
    tw: 'zinc-50',
  },
] as const

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
} as const

