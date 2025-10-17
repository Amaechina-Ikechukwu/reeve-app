export type TransactionFlow = 'credit' | 'debit';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'reversed' | 'processing';
export type TransactionType = 'card' | 'transfer' | 'airtime' | 'data' | 'electricity' | 'cable' | 'esim' | 'vtu' | 'sizzle' | 'giftcard' | string;

export interface Transaction {
  id: string;
  transactionId?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  createdAt: string; // ISO
  flow: TransactionFlow;
}

export interface TransactionsResponse {
  success: boolean;
  message?: string;
  data: Transaction[];
}
