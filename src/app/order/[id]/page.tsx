import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrder } from './action';
import { cn, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import TShirt from '@/components/TShirt';
import { getTranslations } from 'next-intl/server';

export default async function OrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);
  const t = await getTranslations('OrderHistory');
  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('detail.title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            {t('order')} #{order.id}{' '}
            <Badge variant={order.isPaid ? 'success' : 'destructive'}>
              {order.isPaid ? t('paid') : t('unpaid')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {t('detail.infor')}
                </h2>
                <p className="capitalize">
                  {t('status')}: {order.status.replace('_', ' ')}
                </p>
                <p>
                  {t('amount')}: {formatPrice(order.amount)}
                </p>
                <p>
                  {t('detail.date')}: {order.createdAt.toLocaleDateString()}{' '}
                  {order.createdAt.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {t('detail.config')}
                </h2>
                <p className="capitalize">
                  {t('model')}: {order.configuration.model.replace('_', ' ')}
                </p>
                <p className="capitalize">
                  {t('color')}: {order.configuration.color}
                </p>
              </div>
              {order.shippingAddress && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {t('detail.address_config')}
                  </h2>
                  <p>
                    {t('detail.name')}: {order.shippingAddress.name}
                  </p>
                  <p>
                    {t('detail.address')}: {order.shippingAddress.address}
                  </p>
                  <p>Email: {order.shippingAddress.email}</p>
                  <p>
                    {t('detail.phone')}:{' '}
                    {order.shippingAddress.phoneNumber || 'N/A'}
                  </p>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {t('detail.crop_image')}
              </h2>
              <div className="flex items-center justify-center">
                <div className="md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {order.configuration.croppedImages.map((croppedImage) => (
                        <CarouselItem key={croppedImage.id}>
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex aspect-square items-center justify-center p-6">
                                <TShirt
                                  className={cn('max-w-[150px] md:max-w-full')}
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
