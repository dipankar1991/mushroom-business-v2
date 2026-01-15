import type { Transaction, Batch, HarvestLog } from '@/lib/constants';

export interface DatabaseAdapter {
    getTransactions(): Promise<Transaction[]>;
    addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null>;
    updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | null>;
    deleteTransaction(id: string): Promise<void>;

    // Batches
    getBatches(): Promise<Batch[]>;
    addBatch(batch: Omit<Batch, 'id' | 'created_at'>): Promise<Batch | null>;
    updateBatch(id: string, batch: Partial<Batch>): Promise<Batch | null>;
    deleteBatch(id: string): Promise<void>;

    // Harvest Logs
    getHarvestLogs(batchId: string): Promise<HarvestLog[]>;
    addHarvestLog(log: Omit<HarvestLog, 'id' | 'created_at'>): Promise<HarvestLog | null>;
    deleteHarvestLog(id: string): Promise<void>;
}
