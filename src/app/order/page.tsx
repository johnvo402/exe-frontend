import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrders } from './action';
import { formatPrice } from '@/lib/utils';

export default async function OrderHistory() {
  const orders = await getOrders();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  <Link
                    href={`/order/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Order #{order.id.slice(-6)}
                  </Link>
                </CardTitle>
                <Badge variant={order.isPaid ? 'success' : 'destructive'}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              <CardDescription>
                {order.createdAt.toLocaleDateString()}{' '}
                {order.createdAt.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className="capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Amount:</span>
                  <span>{formatPrice(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Shirt Model:</span>
                  <span className="capitalize">
                    {order.configuration.model.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Color:</span>
                  <span className="capitalize">
                    {order.configuration.color}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
