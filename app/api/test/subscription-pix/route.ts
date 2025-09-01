import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MercadoPagoPixTesting } from '@/lib/mercadopago/testing';
import { SubscriptionService } from '@/services/subscriptionService';
import { MERCADO_PAGO_CONFIG } from '@/lib/mercadopago/config';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development/test environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoint not available in production' },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      subscriptionId,
      paymentNumber = 1,
      scenario
    } = body;

    // Validate scenario
    const validScenarios = ['approve', 'reject', 'pending'] as const;
    const testScenario: 'approve' | 'reject' | 'pending' = validScenarios.includes(scenario) ? scenario : 'approve';

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const subscriptionService = new SubscriptionService();
    
    // Get the subscription and payment details
    const subscription = await subscriptionService.getSubscriptionOverview(subscriptionId);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Find the payment to test
    const payment = subscription.payments.find(p => p.paymentNumber === paymentNumber);
    if (!payment) {
      return NextResponse.json(
        { error: `Payment ${paymentNumber} not found for subscription` },
        { status: 404 }
      );
    }

    // Create test PIX payment
    const pixTesting = new MercadoPagoPixTesting();
    const result = await pixTesting.createTestScenario(testScenario, {
      amount: payment.amount,
      externalReference: `test-sub-${subscriptionId}-payment-${paymentNumber}-${Date.now()}`,
      userEmail: session.user.email || 'test@testuser.com',
      webhookUrl: MERCADO_PAGO_CONFIG.WEBHOOK_URL
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create test subscription payment', details: result.error },
        { status: 500 }
      );
    }

    const instructionsMap = {
      approve: 'This payment will be automatically approved by Mercado Pago and update the subscription status',
      reject: 'This payment will be automatically rejected by Mercado Pago',
      pending: 'This payment will remain pending for testing'
    } as const;

    return NextResponse.json({
      message: 'Test subscription PIX payment created successfully',
      subscriptionId,
      paymentNumber,
      paymentId: result.paymentId,
      scenario: result.scenario,
      status: result.status,
      amount: payment.amount,
      pixCode: result.pixCode,
      pixQrCode: result.pixQrCode,
      webhookUrl: MERCADO_PAGO_CONFIG.WEBHOOK_URL,
      instructions: instructionsMap[testScenario],
      nextSteps: [
        '1. Monitor webhook logs in your terminal',
        '2. Check payment status via GET /api/test/pix-payment?paymentId=' + result.paymentId,
        '3. Verify subscription status via GET /api/student/payment-status',
        '4. Check the monthlyPayments collection in Firestore'
      ]
    });

  } catch (error) {
    console.error('Subscription PIX test payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}