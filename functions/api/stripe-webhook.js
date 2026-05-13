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
    
    // In a production CF Worker, we either use Firebase REST API with a service account token
    // or a specialized backend endpoint. 
    // Here we're using the REST API to update the global order document.
    // Note: this requires appropriate Firestore security rules or an authenticated token.
    
    // As a placeholder for full Firebase Admin integration:
    console.log(`[Stripe Webhook] Would update order ${orderId} to ${status}`);
    
    // If the database has a specific endpoint or open rules for webhooks, 
    // it would look like this:
    /*
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=payment.transactionId`;
    
    const response = await fetch(`${firestoreUrl}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${adminToken}` // Required unless rules allow
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
    */
    
    return true;
  } catch (error) {
    console.error('[Stripe Webhook] Error updating Firestore:', error);
    return false;
  }
}
