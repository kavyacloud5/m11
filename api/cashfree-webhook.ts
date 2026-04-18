import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const signature = req.headers['x-cashfree-signature'];
    const backendUrl =
      process.env.BACKEND_URL || process.env.RENDER_BACKEND_URL;

    // Prefer processing the webhook in the Render backend (Neon DB lives there).
    if (backendUrl) {
      const forwardUrl = `${backendUrl.replace(/\/$/, '')}/api/payments/cashfree/webhook`;
      const forwardRes = await fetch(forwardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(signature ? { 'x-cashfree-signature': String(signature) } : {}),
        },
        body: JSON.stringify(req.body),
      });

      if (!forwardRes.ok) {
        const text = await forwardRes.text().catch(() => '');
        console.error('Webhook forward failed:', text);
      }
    } else {
      console.log('Cashfree webhook received:', req.body);
    }

    return res.status(200).json({ message: 'Webhook received' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Cashfree from retrying
    return res.status(200).json({ message: 'Webhook received but processing failed' });
  }
}
