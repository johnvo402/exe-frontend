import { WebhookType } from '@payos/node/lib/type';
import { payos } from '@/lib/payos';
import { db } from '@/db';

export async function POST(request: Request) {
  try {
    // Lấy dữ liệu từ request body
    const body: WebhookType = await request.json();
    const webhookData = payos.verifyPaymentWebhookData(body);
    if (webhookData.orderCode == 123) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Kiểm tra dữ liệu có hợp lệ không
    if (!webhookData?.description) {
      return new Response(JSON.stringify({ error: 'Invalid description' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Lấy ID từ description
    const parts = webhookData.description.split(' ');
    if (parts.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Invalid description format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const id = parts[1];

    // Tìm order trong database
    const order = await db.order.findFirst({
      where: { configurationId: id },
    });

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cập nhật trạng thái đơn hàng
    await db.order.update({
      where: { id: order.id },
      data: { isPaid: true },
    });

    console.log('Order updated successfully!');

    // Trả về phản hồi thành công
    return new Response(JSON.stringify({ message: 'Order updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
