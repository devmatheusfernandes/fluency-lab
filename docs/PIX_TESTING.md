# PIX Payment Testing Guide

This guide explains how to test PIX payments in the Fluency Lab application using Mercado Pago's testing framework.

## Prerequisites

1. **Environment Setup**:
   - Ensure `MERCADO_PAGO_ACCESS_TOKEN` is set to your test access token
   - Ensure `MERCADO_PAGO_WEBHOOK_SECRET` is configured
   - Have ngrok running for webhook testing (if testing locally)
   - Update `NEXT_PUBLIC_APP_URL` to your ngrok URL for local testing

2. **Development Server Running**:
   ```bash
   npm run dev
   ```

## Testing Methods

### 1. Using NPM Scripts (Recommended)

#### Quick Test - Auto Approve
```bash
npm run test:pix:approve
```

#### Test Rejection Scenario
```bash
npm run test:pix:reject
```

#### Test Pending Scenario
```bash
npm run test:pix:pending
```

#### Custom Test
```bash
npm run test:pix test approve 15000  # R$ 150.00
```

#### Check Payment Status
```bash
npm run test:pix check PAYMENT_ID_HERE
```

### 2. Using API Endpoints Directly

#### Create Test Payment
```bash
curl -X POST http://localhost:8080/api/test/pix-payment \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "scenario": "approve",
    "amount": 20000,
    "externalReference": "test-123"
  }'
```

#### Check Payment Status
```bash
curl "http://localhost:8080/api/test/pix-payment?paymentId=PAYMENT_ID"
```

#### Test Subscription Payment
```bash
curl -X POST http://localhost:8080/api/test/subscription-pix \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "subscriptionId": "SUBSCRIPTION_ID",
    "paymentNumber": 1,
    "scenario": "approve"
  }'
```

## Test Scenarios

### Predefined Test Values (from Mercado Pago Documentation)

| Scenario | first_name | Expected Behavior |
|----------|------------|-------------------|
| `approve` | `APRO` | Payment automatically approved |
| `reject` | `REJE` | Payment automatically rejected |
| `pending` | `PEND` | Payment stays pending |

### Test Flow

1. **Create Payment** → Generates PIX QR code
2. **Automatic Processing** → Mercado Pago processes based on `first_name`
3. **Webhook Trigger** → Your app receives webhook notification
4. **Status Update** → Payment status updated in database
5. **Verification** → Check final status via API

## What to Monitor

### 1. Terminal Logs
Watch for webhook events in your development server:
```
Mercado Pago webhook received: {
  type: 'payment',
  dataId: '1234567890',
  action: 'payment.created',
  requestId: 'abc-123-def'
}
```

### 2. Database Changes
Check Firestore collections:
- `monthlyPayments` - Payment records
- `subscriptions` - Subscription status updates

### 3. API Responses
Verify payment status via:
```bash
curl "http://localhost:8080/api/student/payment-status"
```

## Testing Subscription Flow

### Create Subscription + Test Payment
1. Create a PIX subscription via the UI or API
2. Use the test endpoint to simulate payment:
```bash
curl -X POST http://localhost:8080/api/test/subscription-pix \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "YOUR_SUBSCRIPTION_ID",
    "paymentNumber": 1,
    "scenario": "approve"
  }'
```

### Expected Results
- Payment status changes from `available` → `paid`
- Subscription remains `active`
- Next payment becomes available (if applicable)

## Troubleshooting

### Common Issues

1. **Webhook Not Received**:
   - Check ngrok is running
   - Verify `NEXT_PUBLIC_APP_URL` points to ngrok URL
   - Ensure webhook endpoint is accessible

2. **Payment Creation Fails**:
   - Verify `MERCADO_PAGO_ACCESS_TOKEN` is valid
   - Check console for error messages
   - Ensure you're authenticated (valid session)

3. **Status Not Updating**:
   - Check webhook logs for errors
   - Verify webhook signature validation
   - Check Firestore permissions

### Debug Commands

```bash
# Check webhook endpoint
curl "http://localhost:8080/api/payment/mercadopago/webhook"

# Test authentication
curl "http://localhost:8080/api/auth/session"

# Check payment status
curl "http://localhost:8080/api/student/payment-status"
```

## Advanced Testing

### Testing Email Notifications
When payments are processed, email notifications should be sent. Monitor your email service logs to verify delivery.

### Testing Different Amounts
```bash
# Test with different amounts (in centavos)
npm run test:pix test approve 5000   # R$ 50.00
npm run test:pix test approve 10000  # R$ 100.00
npm run test:pix test approve 25000  # R$ 250.00
```

### Testing Error Scenarios
```bash
# Test rejection
npm run test:pix:reject

# Test pending status
npm run test:pix:pending
```

## Production Considerations

⚠️ **Important**: Test endpoints are automatically disabled in production environment.

Before deploying to production:
1. Ensure all test logs are removed
2. Use production Mercado Pago credentials
3. Configure production webhook URLs
4. Test with real bank accounts (small amounts)

## Resources

- [Mercado Pago PIX Testing Documentation](https://www.mercadopago.com.br/developers/pt/docs/qr-code/integration-test)
- [Webhook Testing Guide](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [PIX Payment Flow](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test)