import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe secret key not configured' }, { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  
  try {
    const url = new URL(request.url);
    const origin = url.origin;
    
    const payload = await request.json();
    const { items, orderId, success_url, cancel_url, customer_email } = payload;
    
    // Format items for Stripe
    const line_items = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // convert to paise
      },
      quantity: item.quantity,
    }));
    
    // Add shipping cost if provided
    if (payload.shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(payload.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax if provided
    if (payload.tax > 0) {
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Taxes (GST)',
          },
          unit_amount: Math.round(payload.tax * 100),
        },
        quantity: 1,
      });
    }
    
    // Stripe checkout session in embedded mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items,
      mode: 'payment',
      customer_email,
      return_url: `${origin}/summary?orderId=${orderId}&clearCart=true&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: orderId,
        userId: payload.userId,
      },
    });
    
    return Response.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return Response.json({ error: err.message }, { status: 400 });
  }
}
