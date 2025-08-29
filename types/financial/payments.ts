export interface Payment {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    provider: 'stripe' | 'abacatepay';
    providerTransactionId: string;
    description: string;
    createdAt: Date;
  }