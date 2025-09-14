import Stripe from 'stripe';
import { getEnv } from '@/lib/env/validation';

export const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20' as any, // Use a versão mais recente da API
  typescript: true,
});