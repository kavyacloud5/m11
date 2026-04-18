const express = require('express');
const pool = require('../db');

const router = express.Router();

const CASHFREE_API_BASE =
  process.env.CASHFREE_MODE === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

router.post('/cashfree/session', async (req, res) => {
  const { orderId, amount, customerName, customerEmail, customerPhone, returnUrl } =
    req.body || {};

  if (!orderId || !amount || !customerName || !customerEmail || !returnUrl) {
    return res.status(400).json({
      message:
        'Missing required fields: orderId, amount, customerName, customerEmail, returnUrl',
    });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) {
    return res
      .status(500)
      .json({ message: 'Cashfree credentials missing' });
  }

  try {
    const notifyBase =
      process.env.PUBLIC_URL || process.env.BACKEND_URL || '';
    const notifyUrl = notifyBase
      ? `${notifyBase.replace(/\/$/, '')}/api/payments/cashfree/webhook`
      : undefined;

    const cashfreeResponse = await fetch(`${CASHFREE_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerEmail,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
        },
        order_meta: {
          return_url: returnUrl,
          ...(notifyUrl ? { notify_url: notifyUrl } : {}),
        },
      }),
    });

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      return res.status(500).json({
        message: 'Failed to create payment session',
        error: cashfreeData?.message || 'Unknown error',
      });
    }

    return res.status(200).json({
      paymentSessionId: cashfreeData.payment_session_id,
      orderId: cashfreeData.order_id,
    });
  } catch (error) {
    console.error('Payment session creation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/cashfree/webhook', async (req, res) => {
  try {
    const body = req.body || {};

    const orderId =
      body.orderId ||
      body.order_id ||
      body.data?.order?.order_id ||
      body.data?.order_id;
    const paymentStatus =
      body.paymentStatus ||
      body.payment_status ||
      body.data?.payment?.payment_status ||
      body.data?.payment_status;
    const paymentMessage =
      body.paymentMessage ||
      body.payment_message ||
      body.data?.payment?.payment_message ||
      body.data?.payment_message;
    const paymentTime =
      body.paymentTime ||
      body.payment_time ||
      body.data?.payment?.payment_time ||
      body.data?.payment_time;

    if (!orderId || !paymentStatus) {
      return res.status(200).json({ message: 'Webhook received' });
    }

    const newStatus = paymentStatus === 'SUCCESS' ? 'Fulfilled' : 'Pending';
    await pool.query(
      'UPDATE shop_orders SET status = $1, payment_status = $2, payment_message = $3, payment_time = $4 WHERE id = $5',
      [newStatus, paymentStatus, paymentMessage, paymentTime, orderId]
    );

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(200).json({ message: 'Webhook received' });
  }
});

module.exports = router;

