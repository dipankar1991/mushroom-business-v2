import { supabase } from '@/lib/supabaseClient';
import type { DatabaseAdapter } from '../types';
import type { Transaction } from '@/lib/constants';

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
}
