import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Stripe keys not configured' }, { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature');
  
  try {
    const body = await request.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId, userId } = session.metadata;
      
      console.log(`[Stripe Webhook] Payment successful for order ${orderId} (User: ${userId})`);
      
      // Update order status in Firestore
      // Using REST API or Firebase SDK (if configured). 
      // This requires appropriate Firestore rules or Admin authentication.
      await updateOrderStatusInFirestore(env, orderId, 'Paid', session.id);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook Error] ${err.message}`);
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
}

async function updateOrderStatusInFirestore(env, orderId, status, paymentId) {
  try {
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      console.error('[Stripe Webhook] Missing Firebase configuration (Project ID or API Key)');
      return false;
    }

    // Firestore REST API URL for patching the document
    // We update the 'status' and the transactionId in 'payment.transactionId'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=payment.transactionId&key=${apiKey}`;
    
    console.log(`[Stripe Webhook] Updating order ${orderId} to status: ${status}`);
    
    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          status: { stringValue: status },
          payment: {
            mapValue: {
              fields: {
                transactionId: { stringValue: paymentId }
              }
            }
          }
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Stripe Webhook] Firestore API error: ${response.status}`, errorText);
      return false;
    }
    
    console.log(`[Stripe Webhook] ✅ Order ${orderId} successfully updated to ${status}`);
    return true;
  } catch (error) {
    console.error('[Stripe Webhook] Error updating Firestore:', error);
    return false;
  }
}
