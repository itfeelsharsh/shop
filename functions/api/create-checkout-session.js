import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe secret key not configured' }, { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  
  try {
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
    
      // Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        shipping_address_collection: {
          allowed_countries: ['IN'],
        },
        // Basic stripe test mode card options
        line_items,
        mode: 'payment',
      customer_email,
      success_url: success_url.includes('?') 
        ? `${success_url}&paymentId={CHECKOUT_SESSION_ID}` 
        : `${success_url}?paymentId={CHECKOUT_SESSION_ID}`,
      cancel_url,
      metadata: {
        orderId: orderId,
        userId: payload.userId,
      },
    });
    
    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return Response.json({ error: err.message }, { status: 400 });
  }
}
