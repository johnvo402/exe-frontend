'use client';

import TShirt from '@/components/TShirt';
import { Button } from '@/components/ui/button';
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products';
import { cn, formatPrice } from '@/lib/utils';
import { COLORS, MODELS } from '@/validators/option-validator';
import { ShirtModel, ShirtColor } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import Confetti from 'react-dom-confetti';
import { createOrder, createPayment } from './actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import LoginModal from '@/components/LoginModal';
import { CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { CheckoutRequestType } from '@payos/node/lib/type';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
interface Configuration {
  id: string;
  color: ShirtColor;
  model: ShirtModel;
  createdAt: Date;
  updatedAt: Date;
  croppedImages: { id: string; url: string }[]; // Add this line
}
const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
  const router = useRouter();
  const t = useTranslations('DesignPreview');
  const { toast } = useToast();
  const { id } = configuration;
  const { isAuthenticated } = useKindeBrowserClient();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  useEffect(() => {
    setShowConfetti(true);
  }, []); // Add an empty dependency array to run the effect only once

  const { color, model } = configuration;

  const tw = COLORS.find(
    (supportedColor) => supportedColor.value === color,
  )?.tw;

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model,
  )!;

  let totalPrice = BASE_PRICE + (PRODUCT_PRICES.model[model] || 0) + 30000;
  const [paymentBody, setPaymentBody] = useState<CheckoutRequestType>({
    description: id,
    orderCode: Number(String(new Date().getTime()).slice(-6)),
    amount: totalPrice,
    returnUrl: '',
    cancelUrl: '',
    buyerName: '',
    buyerEmail: '',
    buyerAddress: '',
    buyerPhone: '',
  });

  const { mutate: createPayments } = useMutation({
    mutationKey: ['create-payment'],
    mutationFn: () => createPayment(paymentBody),
    onSuccess: (url) => {
      router.push(url?.checkoutUrl || '');
    },
    onError: (error) => {
      toast({
        title: error.name,
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  const { mutate: createOrders } = useMutation({
    mutationKey: ['get-checkout-session'],
    mutationFn: createOrder,
    onSuccess: async (success) => {
      await createPayments();
      toast({
        title: 'Success',
        description: 'Your order has been created successfully.',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'There was an error on our end. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCheckout = () => {
    if (
      paymentBody.buyerName === '' ||
      paymentBody.buyerEmail === '' ||
      paymentBody.buyerAddress === '' ||
      paymentBody.buyerPhone === ''
    ) {
      toast({
        title: 'Please fill in all fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    if (isAuthenticated) {
      // create payment session
      createOrders({
        configId: id,
        address: paymentBody.buyerAddress || '',
        name: paymentBody.buyerName || '',
        email: paymentBody.buyerEmail || '',
        phoneNumber: paymentBody.buyerPhone || '',
        amount: totalPrice,
      });
    } else {
      // need to log in
      localStorage.setItem('configurationId', id);
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
      >
        <Confetti
          active={showConfetti}
          config={{ elementCount: 200, spread: 90 }}
        />
      </div>

      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />

      <div className="mt-20 flex flex-col items-center md:grid text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12">
        <div className="md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2">
          <Carousel className="w-full max-w-xs">
            <CarouselContent>
              {configuration.croppedImages.map((croppedImage) => (
                <CarouselItem key={croppedImage.id}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <TShirt
                          className={cn(
                            `bg-${tw}`,
                            'max-w-[150px] md:max-w-full',
                          )}
                          imgSrc={croppedImage.url}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div className="mt-6 sm:col-span-9 md:row-end-1">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            {modelLabel}
          </h3>
          <div className="mt-3 flex items-center gap-1.5 text-base">
            <Check className="h-4 w-4 text-green-500" />
            {t('stock')}
          </div>
        </div>

        <div className="sm:col-span-12 md:col-span-9 text-base">
          <div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
            <div>
              <p className="font-medium text-zinc-950"> {t('highlight')}</p>
              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li> {t('highlight.one')}</li>
                <li>{t('highlight.two')}</li>
                <li>{t('highlight.three')}</li>
                <li>{t('highlight.four')}</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-zinc-950">Materials</p>
              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li>{t('highlight.five')}</li>
                <li>{t('highlight.six')}</li>
              </ol>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                {t('infor')}
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="name">{t('field.name')}</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder={t('field.placeholder_name')}
                    value={paymentBody?.buyerName}
                    onChange={(e) =>
                      setPaymentBody({
                        ...paymentBody,
                        buyerName: e?.target?.value || '',
                      })
                    }
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('field.placeholder_email')}
                    value={paymentBody?.buyerEmail}
                    onChange={(e) =>
                      setPaymentBody({
                        ...paymentBody,
                        buyerEmail: e?.target?.value || '',
                      })
                    }
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="phone">{t('field.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('field.placeholder_phone')}
                    value={paymentBody?.buyerPhone}
                    onChange={(e) =>
                      setPaymentBody({
                        ...paymentBody,
                        buyerPhone: e?.target?.value || '',
                      })
                    }
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="address">{t('field.address')}</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder={t('field.placeholder_address')}
                    value={paymentBody?.buyerAddress}
                    onChange={(e) =>
                      setPaymentBody({
                        ...paymentBody,
                        buyerAddress: e?.target?.value || '',
                      })
                    }
                  />
                </div>
              </div>
              <div className="flow-root text-sm">
                <div className="flex items-center justify-between py-1 mt-2">
                  <p className="text-gray-600">{t('base_price')}</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(
                      (PRODUCT_PRICES.model[model] || 0) + BASE_PRICE,
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1 mt-2">
                  <p className="text-gray-600">{t('fee_ship')}</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(30000)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <p className="text-gray-600">{t('color')}</p>
                  <p className="font-medium text-gray-900">
                    {
                      COLORS.find(
                        (supportedColor) => supportedColor.value === color,
                      )?.label
                    }
                  </p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <p className="text-gray-600">{t('model')}</p>
                  <p className="font-medium text-gray-900">{modelLabel}</p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <p className="font-semibold text-gray-900">{t('total')}</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end pb-12">
              <Button
                onClick={() => handleCheckout()}
                className="px-4 sm:px-6 lg:px-8"
              >
                {t('check_out')}{' '}
                <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesignPreview;
