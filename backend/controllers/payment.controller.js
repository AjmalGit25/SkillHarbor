import { Payment } from "../models/payment.model.js";
import { Purchase } from "../models/purchase.model.js";
import stripe from "../config/stripe.js";

export const orderData = async (req, res) => {
  const body = req.body || {};
  try {
    const authUserId = req.userId; // from userMiddleware

    if (!authUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const courseId = body.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Missing courseId' });
    }

    const payload = {
      userId: authUserId,
      courseId: courseId,
      stripeSessionId: body.stripeSessionId || null,
      stripePaymentIntentId: body.stripePaymentIntentId || null,
      amount: body.amount || 0,
      currency: body.currency || 'INR',
      status: body.status || 'completed',
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    };

    const orderInfo = await Payment.create(payload);

    // create purchase if not exists
    const existing = await Purchase.findOne({ userId: authUserId, courseId });
    if (!existing) {
      await Purchase.create({ userId: authUserId, courseId });
    }

    return res.status(201).json({ success: true, message: 'Order saved', orderInfo });
  } catch (error) {
    console.log('Error in order: ', error);
    return res.status(500).json({ success: false, errors: 'Error in order creation' });
  }
};


export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('[Stripe Webhook] Event received:', event.type);
  } catch (error) {
    console.error(
      "[Stripe Webhook] Signature verification failed:",
      error.message
    );

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    console.log(
      "[Stripe Webhook] Payment succeeded:",
      paymentIntent.id
    );

    const { userId, courseId } = paymentIntent.metadata;

    console.log("[Stripe Webhook] User:", userId);
    console.log("[Stripe Webhook] Course:", courseId);

    try {
      if (!userId || !courseId) {
        console.warn('[Stripe Webhook] Missing metadata: userId or courseId');
      } else {
        const amountRaw = paymentIntent.amount_received || paymentIntent.amount || 0;
        const amount = (amountRaw / 100); // convert to major currency unit
        const currency = paymentIntent.currency || 'usd';

        // create order record
        const orderPayload = {
          userId,
          courseId,
          stripeSessionId: paymentIntent?.latest_charge || null,
          stripePaymentIntentId: paymentIntent.id,
          amount,
          currency,
          status: 'completed',
          createdAt: paymentIntent.created ? new Date(paymentIntent.created * 1000) : new Date(),
        };

        // avoid duplicate orders for same payment intent
        const existingOrder = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (existingOrder) {
          console.log('[Stripe Webhook] Order already exists for paymentIntent:', paymentIntent.id);
        } else {
          console.log('[Stripe Webhook] Creating new order:', orderPayload);
          const orderDoc = await Payment.create(orderPayload);
          console.log('[Stripe Webhook] Order saved:', orderDoc._id);
        }

        // create purchase if not already purchased
        const existing = await Purchase.findOne({ userId, courseId });
        if (!existing) {
          await Purchase.create({ userId, courseId });
          console.log('[Stripe Webhook] Purchase created for user:', userId);
        } else {
          console.log('[Stripe Webhook] Purchase already exists, skipping creation');
        }
      }
    } catch (err) {
      console.error('[Stripe Webhook] Failed to persist payment:', err);
    }
  }

  return res.status(200).json({ received: true });
};

export const stripeWebhookPersist = async (req, res) => {
  // kept for compatibility if needed
  return stripeWebhook(req, res);
};