/**
 * Check whether a Razorpay order was placed with Cash on Delivery.
 */
export async function onRequestGet({ request, env }) {
  const keyId = env.RAZORPAY_KEY_ID?.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return Response.json(
      { error: 'Razorpay keys not configured', code: 'KEYS_MISSING' },
      { status: 500 }
    );
  }

  const razorpayOrderId = new URL(request.url).searchParams.get('orderId');
  if (!razorpayOrderId || !/^order_[A-Za-z0-9]+$/.test(razorpayOrderId)) {
    return Response.json(
      { error: 'Invalid Razorpay order ID', code: 'INVALID_ORDER_ID' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}/payments`,
      {
        headers: {
          Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Razorpay] Payment status API error:', errorText);
      return Response.json(
        { error: 'Unable to check Razorpay payment status', code: 'RAZORPAY_ERROR' },
        { status: response.status }
      );
    }

    const paymentList = await response.json();
    const codPayment = paymentList.items?.find(
      (payment) => payment.method === 'cod' && payment.status === 'pending'
    );

    return Response.json({
      codPlaced: Boolean(codPayment),
      paymentId: codPayment?.id || null,
    });
  } catch (error) {
    console.error('[Razorpay] Exception checking payment status:', error);
    return Response.json(
      { error: 'Unable to check Razorpay payment status', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
