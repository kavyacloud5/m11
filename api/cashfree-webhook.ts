import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Verify webhook signature (optional but recommended)
  // Cashfree sends a signature in headers for verification
  const signature = req.headers['x-cashfree-signature'];
  // TODO: Implement signature verification using your webhook secret

  const { orderId, orderAmount, paymentStatus, paymentMessage, paymentTime } = req.body;

  if (!orderId || !paymentStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Update order status in database based on payment status
    const newStatus = paymentStatus === 'SUCCESS' ? 'Fulfilled' : 'Pending';

    // Update order with payment information
    const result = await pool.query(
      'UPDATE shop_orders SET status = $1, payment_status = $2, payment_message = $3, payment_time = $4 WHERE id = $5',
      [newStatus, paymentStatus, paymentMessage, paymentTime, orderId]
    );

    if (result.rowCount === 0) {
      console.warn(`Order ${orderId} not found in database`);
    } else {
      console.log(`Order ${orderId} updated to status: ${newStatus}`);
    }

    // Always return 200 to acknowledge receipt of webhook
    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Cashfree from retrying
    return res.status(200).json({ message: 'Webhook received but processing failed' });
  }
}
