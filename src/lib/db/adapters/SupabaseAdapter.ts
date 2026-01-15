import { supabase } from '@/lib/supabaseClient';
import type { DatabaseAdapter } from '../types';
import type { Transaction, Batch, HarvestLog } from '@/lib/constants';

export class SupabaseAdapter implements DatabaseAdapter {
    async getTransactions(): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }

        return data as Transaction[];
    }

    async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaction)
            .select();

        if (error) throw error;

        return data ? (data[0] as Transaction) : null;
    }

    async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | null> {
        const { data, error } = await supabase
            .from('transactions')
            .update(transaction)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data ? (data[0] as Transaction) : null;
    }

    async deleteTransaction(id: string): Promise<void> {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- Batches (Stubs/Impl) ---
    async getBatches(): Promise<Batch[]> {
        const { data, error } = await supabase.from('batches').select('*').order('start_date', { ascending: false });
        if (error) throw error;
        return data as Batch[];
    }
    async addBatch(batch: Omit<Batch, 'id' | 'created_at'>): Promise<Batch | null> {
        const { data, error } = await supabase.from('batches').insert(batch).select();
        if (error) throw error;
        return data ? data[0] as Batch : null;
    }
    async updateBatch(id: string, batch: Partial<Batch>): Promise<Batch | null> {
        const { data, error } = await supabase.from('batches').update(batch).eq('id', id).select();
        if (error) throw error;
        return data ? data[0] as Batch : null;
    }
    async deleteBatch(id: string): Promise<void> {
        const { error } = await supabase.from('batches').delete().eq('id', id);
        if (error) throw error;
    }

    // --- Harvest Logs ---
    async getHarvestLogs(batchId: string): Promise<HarvestLog[]> {
        const { data, error } = await supabase.from('harvest_logs').select('*').eq('batch_id', batchId).order('date', { ascending: false });
        if (error) throw error;
        return data as HarvestLog[];
    }
    async addHarvestLog(log: Omit<HarvestLog, 'id' | 'created_at'>): Promise<HarvestLog | null> {
        const { data, error } = await supabase.from('harvest_logs').insert(log).select();
        if (error) throw error;
        return data ? data[0] as HarvestLog : null;
    }
    async deleteHarvestLog(id: string): Promise<void> {
        const { error } = await supabase.from('harvest_logs').delete().eq('id', id);
        if (error) throw error;
    }
}
