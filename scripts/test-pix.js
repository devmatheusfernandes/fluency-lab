#!/usr/bin/env node

/**
 * PIX Payment Testing Utility
 * 
 * This script provides easy testing of PIX payments using Mercado Pago's
 * predefined test values. Run this script to test different scenarios.
 * 
 * Usage:
 *   npm run test:pix
 *   or
 *   node scripts/test-pix.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
const DEV_API_KEY = process.env.DEV_TEST_API_KEY || 'dev-test-key-fluency-lab';

async function testPixPayment(scenario = 'approve', amount = 20000) {
  console.log(`🧪 Testing PIX payment with scenario: ${scenario}`);
  console.log(`💰 Amount: R$ ${(amount / 100).toFixed(2)}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('---');

  try {
    const response = await fetch(`${BASE_URL}/api/test/pix-script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DEV_API_KEY
      },
      body: JSON.stringify({
        scenario,
        amount,
        externalReference: `test-script-${Date.now()}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Test failed:', data.error);
      return;
    }

    console.log('✅ Test payment created successfully!');
    console.log(`📧 Payment ID: ${data.paymentId}`);
    console.log(`📊 Status: ${data.status}`);
    console.log(`🎯 Scenario: ${data.scenario}`);
    console.log('');
    console.log('💡 Instructions:');
    console.log(data.instructions);
    console.log('');
    console.log('🔗 PIX Code (first 50 chars):');
    console.log(data.pixCode ? data.pixCode.substring(0, 50) + '...' : 'Not available');
    console.log('');
    console.log('🔍 To check payment status:');
    console.log(`curl -H "x-api-key: ${DEV_API_KEY}" "${BASE_URL}/api/test/pix-script?paymentId=${data.paymentId}"`);
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Monitor your terminal for webhook events');
    console.log('2. Check payment status using the URL above');
    console.log('3. Verify database changes in Firestore');

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function checkPaymentStatus(paymentId) {
  console.log(`🔍 Checking payment status for: ${paymentId}`);
  console.log('---');

  try {
    const response = await fetch(`${BASE_URL}/api/test/pix-script?paymentId=${paymentId}`, {
      headers: {
        'x-api-key': DEV_API_KEY
      }
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Status check failed:', data.error);
      return;
    }

    console.log('✅ Payment status retrieved:');
    console.log(`📧 Payment ID: ${data.paymentId}`);
    console.log(`📊 Status: ${data.status}`);
    console.log(`📝 Status Detail: ${data.statusDetail}`);
    console.log('');
    console.log('📋 Full response:');
    console.log(JSON.stringify(data.response, null, 2));

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'create':
  case 'test':
    const scenario = args[1] || 'approve';
    const amount = parseInt(args[2]) || 20000;
    testPixPayment(scenario, amount);
    break;

  case 'check':
  case 'status':
    const paymentId = args[1];
    if (!paymentId) {
      console.error('❌ Payment ID is required for status check');
      console.log('Usage: node scripts/test-pix.js check PAYMENT_ID');
      process.exit(1);
    }
    checkPaymentStatus(paymentId);
    break;

  case 'help':
  default:
    console.log('🧪 PIX Payment Testing Utility');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/test-pix.js test [scenario] [amount]');
    console.log('  node scripts/test-pix.js check [paymentId]');
    console.log('');
    console.log('Scenarios:');
    console.log('  approve  - Payment automatically approved (default)');
    console.log('  reject   - Payment automatically rejected');
    console.log('  pending  - Payment stays pending');
    console.log('');
    console.log('Amount:');
    console.log('  Amount in centavos (default: 20000 = R$ 200.00)');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/test-pix.js test approve 15000');
    console.log('  node scripts/test-pix.js test reject');
    console.log('  node scripts/test-pix.js check PAYMENT_ID_HERE');
    break;
}