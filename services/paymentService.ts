// services/paymentService.ts

import { stripe } from '@/lib/stripe/stripe';
import { UserRoles } from '@/types/users/userRoles';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
// Não precisamos mais do UserRepository aqui
// import { UserRepository } from '@/repositories/userRepository';

interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  userEmail: string;
  credits: number;
}

interface FulfillPaymentParams {
  userId: string;
  stripeCustomerId: string;
  credits: number;
}

export class PaymentService {
  // Não precisamos mais do construtor ou das instâncias do repositório aqui

  /**
   * Usa o Admin SDK para buscar um usuário pelo ID.
   * Retorna o documento do usuário ou null se não for encontrado.
   */
  private async findUserById_Admin(userId: string) {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data();
  }
  
  /**
   * Verifica se um usuário já tem um ID de cliente no Stripe.
   * Se não tiver, cria um novo cliente no Stripe e salva o ID no Firestore.
   * Retorna o ID do cliente do Stripe.
   */
  private async getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
    const user = await this.findUserById_Admin(userId);

    if (!user) {
      throw new Error("Usuário não encontrado para criar cliente no Stripe.");
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: email,
      name: user.name,
      metadata: { firebaseUID: userId },
    });

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({ stripeCustomerId: customer.id });
    
    console.log(`Novo cliente Stripe criado e salvo para o usuário: ${userId}`);
    return customer.id;
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams) {
    const { priceId, userId, userEmail, credits } = params;

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/hub/dashboard?payment=success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup/success`;
    
    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId, userEmail);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        credits: String(credits),
      }
    });

    return session;
  }

  async fulfillOneTimePayment(params: FulfillPaymentParams) {
    const { userId, stripeCustomerId, credits } = params;

    console.log(`Registrando compra de ${credits} créditos para o usuário: ${userId}`);

    const updatedData = {
      role: UserRoles.OCCASIONAL_STUDENT,
      stripeCustomerId,
      classCredits: FieldValue.increment(credits),
    };

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update(updatedData);
  }
}