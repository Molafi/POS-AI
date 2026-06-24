import Stripe from 'stripe';
import { getApiKey } from './security';

const STRIPE_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

function getStripeClient(): Stripe {
  const apiKey = getApiKey('stripe_secret_key') || process.env.STRIPE_SECRET_KEY || '';
  if (!apiKey) {
    throw new Error('Stripe API key not configured. Set it in Settings or STRIPE_SECRET_KEY environment variable.');
  }
  return new Stripe(apiKey, {
    apiVersion: '2024-04-10' as Stripe.LatestApiVersion,
    timeout: STRIPE_TIMEOUT,
  });
}

async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors or auth errors
      if (error instanceof Stripe.errors.StripeError) {
        if (
          error.type === 'StripeInvalidRequestError' ||
          error.type === 'StripeAuthenticationError'
        ) {
          throw error;
        }
      }

      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Payment processing failed after retries');
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

export interface PaymentConfirmResult {
  id: string;
  status: string;
  amount: number;
  receiptUrl: string | null;
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<PaymentIntentResult> {
  return withRetry(async () => {
    const stripe = getStripeClient();

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: metadata || {},
    });

    return {
      id: intent.id,
      clientSecret: intent.client_secret || '',
      status: intent.status,
      amount: intent.amount / 100,
      currency: intent.currency,
    };
  });
}

export async function confirmPayment(paymentIntentId: string): Promise<PaymentConfirmResult> {
  return withRetry(async () => {
    const stripe = getStripeClient();

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: intent.id,
      status: intent.status,
      amount: intent.amount / 100,
      receiptUrl: typeof intent.latest_charge === 'string' ? null : null,
    };
  });
}

export async function cancelPayment(paymentIntentId: string): Promise<{ id: string; status: string }> {
  return withRetry(async () => {
    const stripe = getStripeClient();

    const intent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      id: intent.id,
      status: intent.status,
    };
  });
}

export function isStripeConfigured(): boolean {
  return !!(getApiKey('stripe_secret_key') || process.env.STRIPE_SECRET_KEY);
}
