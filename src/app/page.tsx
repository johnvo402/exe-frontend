import { Icons } from '@/components/Icons';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import TShirt from '@/components/TShirt';
import { Reviews } from '@/components/Reviews';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, Check, Star } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl'; // Adjust import based on your i18n setup

export default function Home() {
  const t = useTranslations('home'); // Hook to access "home" namespace translations

  return (
    <div className="bg-slate-50 grainy-light">
      <section>
        <MaxWidthWrapper className="pb-24 pt-10 lg:grid lg:grid-cols-3 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-24 xl:pt-32 lg:pb-52">
          <div className="col-span-2 px-6 lg:px-0 lg:pt-4">
            <div className="relative mx-auto text-center lg:text-left flex flex-col items-center lg:items-start">
              <h1 className="relative w-fit tracking-tight text-balance mt-16 font-bold !leading-tight text-gray-900 text-5xl md:text-6xl lg:text-7xl">
                {t('title1')}{' '}
                <span className="bg-black px-2 text-white">{t('title2')}</span>{' '}
                {t('title3')}
              </h1>
              <p className="mt-8 text-lg lg:pr-10 max-w-prose text-center lg:text-left text-balance md:text-wrap">
                {t('description').split('one-of-one')[0]}{' '}
                <span className="font-semibold">one-of-one</span>{' '}
                {t('description').split('one-of-one')[1]}
              </p>

              <ul className="mt-8 space-y-2 text-left font-medium flex flex-col items-center sm:items-start">
                <div className="space-y-2">
                  <li className="flex gap-1.5 items-center text-left">
                    <Check className="h-5 w-5 shrink-0 text-black" />
                    {t('purpose.one')}
                  </li>
                  <li className="flex gap-1.5 items-center text-left">
                    <Check className="h-5 w-5 shrink-0 text-black" />
                    {t('purpose.two')}
                  </li>
                  <li className="flex gap-1.5 items-center text-left">
                    <Check className="h-5 w-5 shrink-0 text-black" />
                    {t('purpose.three')}
                  </li>
                </div>
              </ul>

              <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="flex -space-x-4">
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src="/users/user-1.png"
                    alt="user image"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src="/users/user-2.png"
                    alt="user image"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src="/users/user-3.png"
                    alt="user image"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src="/users/user-4.jpg"
                    alt="user image"
                  />
                  <img
                    className="inline-block object-cover h-10 w-10 rounded-full ring-2 ring-slate-100"
                    src="/users/user-5.jpg"
                    alt="user image"
                  />
                </div>

                <div className="flex flex-col justify-between items-center sm:items-start">
                  <div className="flex gap-0.5">
                    <Star className="h-4 w-4 text-black fill-black" />
                    <Star className="h-4 w-4 text-black fill-black" />
                    <Star className="h-4 w-4 text-black fill-black" />
                    <Star className="h-4 w-4 text-black fill-black" />
                    <Star className="h-4 w-4 text-black fill-black" />
                  </div>
                  <p>
                    <span className="font-semibold">1.250</span> {t('feedback')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-full lg:col-span-1 w-full flex justify-center px-8 sm:px-16 md:px-0 mt-32 lg:mx-0 lg:mt-20 h-fit">
            <div className="relative md:max-w-xl">
              <img
                src="/your-image.png"
                className="absolute w-40 lg:w-52 left-56 -top-20 select-none hidden sm:block lg:hidden xl:block"
                alt="overlaying t-shirt image"
              />
              <img
                src="/line.png"
                className="absolute w-20 -left-6 -bottom-6 select-none"
                alt="line image"
              />
              <TShirt className="w-96" imgSrc="/testimonials/1.jpg" />
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Value proposition section */}
      <section className="bg-slate-100 grainy-dark py-24">
        <MaxWidthWrapper className="flex flex-col items-center gap-16 sm:gap-32">
          <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
            <h2 className="order-1 mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
              {t('customer.say')}
            </h2>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 px-4 lg:mx-0 lg:max-w-none lg:grid-cols-2 gap-y-16">
            <div className="flex flex-auto flex-col gap-4 lg:pr-8 xl:pr-20">
              <div className="flex gap-0.5 mb-2">
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
              </div>
              <div className="text-lg leading-8">
                <p>
                  "The T-Shirt feels durable and I even got a compliment on the
                  design. Had the T-Shirt for two and a half months now and{' '}
                  <span className="p-0.5 bg-slate-800 text-white">
                    the print is super clear
                  </span>
                  , on the T-Shirt I had before, the print started fading into
                  yellow-ish color after a couple weeks. Love it."
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                <img
                  className="rounded-full h-12 w-12 object-cover"
                  src="/users/user-1.png"
                  alt="user"
                />
                <div className="flex flex-col">
                  <p className="font-semibold">Jonathan</p>
                  <div className="flex gap-1.5 items-center text-zinc-600">
                    <Check className="h-4 w-4 stroke-[3px] text-black" />
                    <p className="text-sm">Verified Purchase</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second user review */}
            <div className="flex flex-auto flex-col gap-4 lg:pr-8 xl:pr-20">
              <div className="flex gap-0.5 mb-2">
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
                <Star className="h-5 w-5 text-black fill-black" />
              </div>
              <div className="text-lg leading-8">
                <p>
                  "I usually wear my T-Shirts frequently and that led to some
                  pretty heavy wear on all of my last T-Shirts. This one,
                  besides a barely noticeable wear on the corner,{' '}
                  <span className="p-0.5 bg-slate-800 text-white">
                    looks brand new after about half a year
                  </span>
                  . I dig it."
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                <img
                  className="rounded-full h-12 w-12 object-cover"
                  src="/users/user-4.jpg"
                  alt="user"
                />
                <div className="flex flex-col">
                  <p className="font-semibold">Josh</p>
                  <div className="flex gap-1.5 items-center text-zinc-600">
                    <Check className="h-4 w-4 stroke-[3px] text-black" />
                    <p className="text-sm">Verified Purchase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>

        <div className="pt-16">
          <Reviews />
        </div>
      </section>

      <section>
        <MaxWidthWrapper className="py-24">
          <div className="mb-12 px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="order-1 mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
                {t('foothome.title').split('your own T-Shirt')[0]}{' '}
                <span className="relative px-2 bg-black text-white">
                  your own T-Shirt
                </span>{' '}
                {t('foothome.title').split('your own T-Shirt')[1]}
              </h2>
            </div>
          </div>

          <ul className="mx-auto mt-12 max-w-prose sm:text-lg space-y-2 w-fit">
            <li className="w-fit">
              <Check className="h-5 w-5 text-black inline mr-1.5" />
              {t('foothome.purpose.one')}
            </li>
            <li className="w-fit">
              <Check className="h-5 w-5 text-black inline mr-1.5" />
              {t('foothome.purpose.two')}
            </li>
            <li className="w-fit">
              <Check className="h-5 w-5 text-black inline mr-1.5" />
              {t('foothome.purpose.three')}
            </li>
            <li className="w-fit">
              <Check className="h-5 w-5 text-black inline mr-1.5" />
              {t('foothome.purpose.four')}
            </li>

            <div className="flex justify-center">
              <Link
                className={buttonVariants({
                  size: 'lg',
                  className: 'mx-auto mt-8',
                })}
                href="/configure/design"
              >
                {t('foothome.button')} <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          </ul>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
