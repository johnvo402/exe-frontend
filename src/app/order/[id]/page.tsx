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

export default async function OrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            Order #{order.id}{' '}
            <Badge variant={order.isPaid ? 'success' : 'destructive'}>
              {order.isPaid ? 'Paid' : 'Unpaid'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Order Information
                </h2>
                <p className="capitalize">
                  Status: {order.status.replace('_', ' ')}
                </p>
                <p>Amount: {formatPrice(order.amount)}</p>
                <p>
                  Date: {order.createdAt.toLocaleDateString()}{' '}
                  {order.createdAt.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Shirt Configuration
                </h2>
                <p className="capitalize">
                  Model: {order.configuration.model.replace('_', ' ')}
                </p>
                <p className="capitalize">Color: {order.configuration.color}</p>
              </div>
              {order.shippingAddress && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Shipping Address
                  </h2>
                  <p>Name: {order.shippingAddress.name}</p>
                  <p>Address: {order.shippingAddress.address}</p>
                  <p>Email: {order.shippingAddress.email}</p>
                  <p>Phone: {order.shippingAddress.phoneNumber || 'N/A'}</p>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Cropped Images</h2>
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
