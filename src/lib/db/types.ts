import type { Transaction } from '@/lib/constants';

export interface DatabaseAdapter {
    getTransactions(): Promise<Transaction[]>;
    addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null>;
    updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | null>;
    deleteTransaction(id: string): Promise<void>;
}
