import type { DatabaseAdapter } from '../types';
import type { Transaction } from '@/lib/constants';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL;

export class GoogleSheetsAdapter implements DatabaseAdapter {
    async getTransactions(): Promise<Transaction[]> {
        if (!GOOGLE_SCRIPT_URL) {
            console.error("VITE_GOOGLE_SHEETS_URL is missing in .env");
            return [];
        }

        try {
            // mode: 'cors' is crucial for fetch to GAS
            const response = await fetch(GOOGLE_SCRIPT_URL);

            if (!response.ok) {
                throw new Error(`Google Sheets API error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Ensure types match
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((t: any) => ({
                ...t,
                debit: Number(t.debit),
                credit: Number(t.credit)
            })) as Transaction[];

        } catch (error) {
            console.error('Google Sheets fetch error:', error);
            throw error;
        }
    }

    async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
        if (!GOOGLE_SCRIPT_URL) {
            throw new Error("VITE_GOOGLE_SHEETS_URL is missing");
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(transaction)
            });

            if (!response.ok) {
                throw new Error(`Google Sheets API error: ${response.statusText}`);
            }

            const savedData = await response.json();
            if (savedData.error) throw new Error(savedData.error);

            return savedData as Transaction;

        } catch (error) {
            console.error('Google Sheets insert error:', error);
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateTransaction(_id: string, _transaction: Partial<Transaction>): Promise<Transaction | null> {
        // Placeholder until GAS script is updated
        console.warn("Update not implemented for Google Sheets yet.");
        throw new Error("Update not supported for Google Sheets yet.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteTransaction(_id: string): Promise<void> {
        // Placeholder until GAS script is updated
        console.warn("Delete not implemented for Google Sheets yet.");
        throw new Error("Delete not supported for Google Sheets yet.");
    }
}
