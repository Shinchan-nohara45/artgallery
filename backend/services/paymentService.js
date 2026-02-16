// backend/services/paymentService.js
import Stripe from 'stripe';
import config from '../config/index.js';

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

// Function to create a Stripe Checkout Session
const createCheckoutSession = async (orderItems, orderId, shippingInfo) => {
  const line_items = orderItems.map(item => ({
    price_data: {
      currency: 'usd', // Or your desired currency
      product_data: {
        name: item.name,
        images: [item.imageUrl], // Use the artwork image
        description: `Artwork by: ${item.artistName || 'Various'}`, // Add artist name if available
      },
      unit_amount: Math.round(item.price * 100), // Price in cents
    },
    quantity: item.qty,
  }));

  // Add shipping cost if applicable
  if (shippingInfo && shippingInfo.shippingPrice > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping',
          description: 'Standard Shipping Cost',
        },
        unit_amount: Math.round(shippingInfo.shippingPrice * 100), // Price in cents
      },
      quantity: 1,
    });
  }

  // Add tax if applicable (simplify for now, real tax calculation is complex)
  if (shippingInfo && shippingInfo.taxPrice > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax',
          description: 'Sales Tax',
        },
        unit_amount: Math.round(shippingInfo.taxPrice * 100), // Price in cents
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/order/${orderId}/success?session_id={CHECKOUT_SESSION_ID}`, // Redirect after success
    cancel_url: `${process.env.FRONTEND_URL}/checkout/${orderId}/cancel`, // Redirect after cancel
    customer_email: shippingInfo.email, // Pre-fill customer email if available
    metadata: {
      orderId: orderId.toString(), // Attach order ID for webhook
      // Other metadata you want to track
    },
  });

  return session;
};

// Function to handle Stripe webhooks (will be in paymentController)
// This service function could verify the event
const verifyStripeWebhook = (rawBody, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }
};


export {
  createCheckoutSession,
  verifyStripeWebhook,
};