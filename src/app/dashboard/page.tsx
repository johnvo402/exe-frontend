import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/db';
import { formatPrice } from '@/lib/utils';
import { notFound } from 'next/navigation';
import StatusDropdown from './StatusDropdown';
import DownloadButton from '@/components/DownloadButton';
import { getOrderData } from './actions';
import { checkRole } from '@/lib/useRoleAndPermission';
import { getTranslations } from 'next-intl/server';
const Page = async () => {
  const { orders, lastWeekSum, lastMonthSum } = await getOrderData();

  const isAdmin = await checkRole('admin-exe');
  if (!isAdmin) {
    return notFound();
  }

  const WEEKLY_GOAL = 1000000;
  const MONTHLY_GOAL = 5000000;
  const t = await getTranslations('admin');
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4">
        <div className="flex flex-col gap-16">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('last_week')}</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastWeekSum._sum.amount ?? 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {t('of')} {formatPrice(WEEKLY_GOAL)} {t('goal')}
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={((lastWeekSum._sum.amount ?? 0) * 100) / WEEKLY_GOAL}
                />
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('last_month')}</CardDescription>
                <CardTitle className="text-4xl">
                  {formatPrice(lastMonthSum._sum.amount ?? 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {t('of')} {formatPrice(MONTHLY_GOAL)} {t('goal')}
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={((lastMonthSum._sum.amount ?? 0) * 100) / MONTHLY_GOAL}
                />
              </CardFooter>
            </Card>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            {t('income_order')}{' '}
          </h1>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('code')} </TableHead>
                <TableHead>{t('customer')} </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t('status')}{' '}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t('purchase_date')}
                </TableHead>
                <TableHead className="text-right">{t('amount')} </TableHead>
                <TableHead className="text-right">{t('Payment')} </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="bg-accent">
                  <TableCell>
                    <div className="font-medium">
                      <a href={`/order/${order.id}`} className="text-blue-600">
                        #{order.id.slice(-6)}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {order.shippingAddress?.name}
                    </div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {order.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusDropdown id={order.id} orderStatus={order.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.configuration.croppedImages[0]?.url && (
                      <DownloadButton
                        croppedImg={order.configuration.croppedImages}
                        stickImg={order.configuration.ConfigurationImage.map(
                          (img) => img.imageUrl,
                        )}
                        configImg={order.configuration.ConfigurationImage}
                        customName={
                          order.shippingAddress?.name || order.user.email
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;

// Function to handle image download
