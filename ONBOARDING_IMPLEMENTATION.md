# Onboarding System - Implementation Guide

## Overview

A comprehensive onboarding system for regular students (role: `STUDENT`) that guides new users through account setup, contract selection, signing, and payment configuration.

## Features Implemented

### 📋 Complete Onboarding Flow

1. **Welcome Step** - Greets new users and explains the process
2. **Platform Overview** - Shows platform features and capabilities
3. **Basic Info Collection** - Collects nickname, language, and theme preferences
4. **Email Verification** - Optional step for email verification
5. **Best Practices & Contract Summary** - Educational content and contract overview
6. **Contract Selection** - Choose between 6 or 12-month contracts
7. **Contract Review & Signature** - Digital contract signing with integrated forms
8. **Payment Setup** - Choose between PIX and Credit Card payment methods
9. **Completion** - Congratulations and next steps

### 🎨 Design Features

- **Responsive Design** - Works on all screen sizes
- **Dark/Light Theme Support** - Respects user's theme preference
- **Smooth Animations** - CSS-based animations and transitions
- **Progress Tracking** - Visual progress indicator
- **Accessibility** - Supports reduced motion and high contrast preferences

### 🔧 Technical Implementation

- **Modal-based UI** - Cannot be closed during critical steps (contract/payment)
- **Step Navigation** - Forward/backward navigation with validation
- **Real-time Validation** - Form validation with immediate feedback
- **Error Handling** - Comprehensive error handling and user feedback
- **Session Integration** - Integrates with NextAuth session management
- **API Integration** - Connects to existing contract and subscription services

## File Structure

```
components/onboarding/
├── OnboardingModal.tsx          # Main modal component with step navigation
├── OnboardingWrapper.tsx        # Wrapper component for integration
├── onboarding.css              # Styling and animations
├── index.ts                    # Export declarations
└── steps/
    ├── WelcomeStep.tsx         # Welcome and introduction
    ├── PlatformOverviewStep.tsx # Feature overview
    ├── BasicInfoStep.tsx       # User preferences collection
    ├── EmailVerificationStep.tsx # Optional email verification
    ├── BestPracticesStep.tsx   # Guidelines and contract summary
    ├── ContractSelectionStep.tsx # Contract duration selection
    ├── ContractReviewStep.tsx  # Contract review and signing
    ├── PaymentStep.tsx         # Payment method selection
    ├── FinishStep.tsx          # Completion and next steps
    └── index.ts                # Step exports

hooks/
└── useOnboarding.ts            # Onboarding state management hook

app/api/onboarding/
├── complete/route.ts           # Mark onboarding as complete
├── sign-contract/route.ts      # Handle contract signing
└── create-subscription/route.ts # Create subscription

app/api/auth/
├── verification-status/route.ts # Check email verification status
└── resend-verification/route.ts # Resend verification email
```

## Integration Points

### 1. Authentication Flow

- New users are automatically redirected to onboarding after signup
- Onboarding triggers when `session.user.role === 'STUDENT'` and `!session.user.tutorialCompleted`

### 2. Hub Layout Integration

- `OnboardingWrapper` component integrated into main hub layout
- Automatically shows onboarding modal for eligible users

### 3. Contract System Integration

- Uses existing `ContratoPDF` component for contract display
- Integrates with contract signing and logging system
- Updates user's `contractLengthMonths` field

### 4. Payment System Integration

- Connects to existing `SubscriptionService`
- Supports both PIX and Credit Card payment methods
- Creates subscriptions with proper contract duration

### 5. User Management Integration

- Updates user profile with onboarding completion status
- Sets `tutorialCompleted: true` after successful completion

## Usage

### For New Users

1. User signs up with `STUDENT` role
2. After authentication, hub layout detects incomplete onboarding
3. `OnboardingWrapper` shows the onboarding modal automatically
4. User completes all steps before accessing the platform

### For Developers

```tsx
import { OnboardingWrapper } from "@/components/onboarding";

// Wrap your main layout
<OnboardingWrapper>
  <YourMainContent />
</OnboardingWrapper>;
```

## Configuration

### Environment Variables Required

```bash
# Mercado Pago Integration
MERCADO_PAGO_ACCESS_TOKEN=your_token
MERCADO_PAGO_WEBHOOK_SECRET=your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Testing (optional)
DEV_TEST_API_KEY=dev-test-key-fluency-lab
```

### User Role Configuration

The onboarding system specifically targets users with:

- `role: 'STUDENT'` (regular students)
- `tutorialCompleted: false` or undefined

## Testing Checklist

### ✅ Manual Testing

- [ ] New user signup flow triggers onboarding
- [ ] All 9 steps navigate correctly
- [ ] Form validation works on all input fields
- [ ] Contract selection affects pricing display
- [ ] Contract signing creates proper database records
- [ ] PIX payment creates subscription correctly
- [ ] Credit card payment redirects to external URL
- [ ] Payment return flow marks onboarding complete
- [ ] Modal cannot be closed during critical steps
- [ ] Responsive design works on mobile/tablet
- [ ] Dark/light theme switching works
- [ ] Accessibility features (keyboard navigation, screen readers)

### ✅ API Testing

- [ ] POST `/api/onboarding/complete` updates user correctly
- [ ] POST `/api/onboarding/sign-contract` creates contract log
- [ ] POST `/api/onboarding/create-subscription` integrates with payment system
- [ ] GET `/api/auth/verification-status` returns correct status
- [ ] POST `/api/auth/resend-verification` sends email

### ✅ Integration Testing

- [ ] Session management works correctly
- [ ] User role detection functions properly
- [ ] Contract duration affects subscription creation
- [ ] Payment method selection creates correct subscription type
- [ ] Onboarding completion updates user session
- [ ] Navigation after completion works

### ✅ Error Handling

- [ ] Network errors are handled gracefully
- [ ] Form validation prevents invalid submissions
- [ ] API errors show appropriate user messages
- [ ] Payment failures are handled correctly
- [ ] Contract signing errors are caught
- [ ] Browser compatibility issues addressed

## Troubleshooting

### Common Issues

1. **Onboarding not showing**
   - Check user role is `STUDENT`
   - Verify `tutorialCompleted` is false/undefined
   - Check session authentication status

2. **Contract signing fails**
   - Verify all required fields are filled
   - Check CPF validation logic
   - Ensure user is 18+ years old

3. **Payment creation fails**
   - Check Mercado Pago credentials
   - Verify webhook URL is accessible
   - Check contract duration is 6 or 12 months

4. **Styling issues**
   - Import `onboarding.css` in main component
   - Check Tailwind CSS classes are available
   - Verify dark/light theme CSS variables

## Future Enhancements

### Potential Improvements

- [ ] Add animation between step transitions
- [ ] Implement step-specific progress persistence
- [ ] Add email verification integration
- [ ] Create onboarding analytics tracking
- [ ] Add multilingual support
- [ ] Implement onboarding customization by user type
- [ ] Add video tutorials for complex steps
- [ ] Create onboarding completion certificates

### Performance Optimizations

- [ ] Lazy load step components
- [ ] Implement step data caching
- [ ] Optimize image assets
- [ ] Add service worker for offline support

## Security Considerations

### Implemented Security Measures

- ✅ Server-side session validation
- ✅ CSRF protection via NextAuth
- ✅ Input sanitization and validation
- ✅ Secure contract signing with browser/IP tracking
- ✅ Payment processing through secure external providers
- ✅ Webhook signature verification

### Additional Recommendations

- [ ] Implement rate limiting on API endpoints
- [ ] Add audit logging for contract operations
- [ ] Monitor for suspicious onboarding patterns
- [ ] Implement session timeout during long onboarding

---

**Note**: This onboarding system is designed for production use with proper error handling, accessibility support, and integration with existing systems. All components follow the project's established patterns and conventions.
