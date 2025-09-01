import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoPixTesting } from '@/lib/mercadopago/testing';
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

    // Simple API key check for script access
    const apiKey = request.headers.get('x-api-key');
    const devApiKey = process.env.DEV_TEST_API_KEY || 'dev-test-key-fluency-lab';
    
    if (apiKey !== devApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key for test endpoint' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      amount = 20000, // Default R$ 200.00 in centavos
      scenario,
      externalReference,
      userEmail = 'test@fluencylab.com'
    } = body;

    // Validate scenario
    const validScenarios = ['approve', 'reject', 'pending'] as const;
    const testScenario: 'approve' | 'reject' | 'pending' = validScenarios.includes(scenario) ? scenario : 'approve';

    const pixTesting = new MercadoPagoPixTesting();
    
    const result = await pixTesting.createTestScenario(testScenario, {
      amount,
      externalReference: externalReference || `script-test-${Date.now()}`,
      userEmail,
      webhookUrl: MERCADO_PAGO_CONFIG.WEBHOOK_URL
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create test payment', details: result.error },
        { status: 500 }
      );
    }

    const instructionsMap = {
      approve: 'This payment will be automatically approved by Mercado Pago',
      reject: 'This payment will be automatically rejected by Mercado Pago',
      pending: 'This payment will remain pending for testing'
    } as const;

    return NextResponse.json({
      message: 'Test PIX payment created successfully',
      paymentId: result.paymentId,
      scenario: result.scenario,
      status: result.status,
      pixCode: result.pixCode,
      pixQrCode: result.pixQrCode,
      webhookUrl: MERCADO_PAGO_CONFIG.WEBHOOK_URL,
      instructions: instructionsMap[testScenario]
    });

  } catch (error) {
    console.error('PIX test payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only allow in development/test environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoint not available in production' },
        { status: 403 }
      );
    }

    // Simple API key check for script access
    const apiKey = request.headers.get('x-api-key');
    const devApiKey = process.env.DEV_TEST_API_KEY || 'dev-test-key-fluency-lab';
    
    if (apiKey !== devApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key for test endpoint' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const pixTesting = new MercadoPagoPixTesting();
    const result = await pixTesting.checkPaymentStatus(paymentId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to check payment status', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentId: result.id,
      status: result.status,
      statusDetail: result.statusDetail,
      response: result.response
    });

  } catch (error) {
    console.error('PIX payment status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}