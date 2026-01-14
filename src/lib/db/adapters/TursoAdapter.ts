import { turso } from '@/lib/tursoClient';
import type { DatabaseAdapter } from '../types';
import type { Transaction } from '@/lib/constants';

export class TursoAdapter implements DatabaseAdapter {
    async getTransactions(): Promise<Transaction[]> {
        try {
            const result = await turso.execute('SELECT * FROM transactions ORDER BY date DESC');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const txs = result.rows.map((row: any) => ({
                id: row.id,
                created_at: row.created_at,
                date: row.date,
                type: row.type,
                category: row.category,
                subcategory: row.subcategory,
                description: row.description,
                debit: Number(row.debit),
                credit: Number(row.credit),
                notes: row.notes,
                user_id: row.user_id
            })) as Transaction[];

            return txs;
        } catch (error) {
            console.error('Turso fetch error:', error);
            throw error;
        }
    }

    async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
        try {
            const {
                date, type, category, subcategory, description, debit, credit, notes
            } = transaction;

            const createdAt = new Date().toISOString();
            const id = crypto.randomUUID();

            // Updated SQL to include ID
            const sqlWithId = `
        INSERT INTO transactions (
            id, date, type, category, subcategory, description, debit, credit, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *;
      `;

            const result = await turso.execute({
                sql: sqlWithId,
                args: [
                    id,
                    date,
                    type,
                    category,
                    subcategory || null,
                    description,
                    debit,
                    credit,
                    notes || null,
                    createdAt
                ]
            });

            if (result.rows.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const row = result.rows[0] as any;
                return {
                    id: row.id,
                    created_at: row.created_at,
                    date: row.date,
                    type: row.type,
                    category: row.category,
                    subcategory: row.subcategory,
                    description: row.description,
                    debit: Number(row.debit),
                    credit: Number(row.credit),
                    notes: row.notes
                } as Transaction;
            }
            return null;

        } catch (error) {
            console.error('Turso insert error:', error);
            throw error;
        }
    }

    async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | null> {
        const sets: string[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args: any[] = [];

        // Dynamically build SET clause
        Object.entries(transaction).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'created_at' && value !== undefined) {
                sets.push(`${key} = ?`);
                args.push(value);
            }
        });

        if (sets.length === 0) return null;

        args.push(id); // For WHERE clause

        const sql = `
      UPDATE transactions 
      SET ${sets.join(', ')}
      WHERE id = ?
      RETURNING *;
    `;

        try {
            const result = await turso.execute({ sql, args });
            if (result.rows.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const row = result.rows[0] as any;
                return {
                    id: row.id,
                    created_at: row.created_at,
                    date: row.date,
                    type: row.type,
                    category: row.category,
                    subcategory: row.subcategory,
                    description: row.description,
                    debit: Number(row.debit),
                    credit: Number(row.credit),
                    notes: row.notes
                } as Transaction;
            }
            return null;
        } catch (error) {
            console.error("Turso update error", error);
            throw error;
        }
    }

    async deleteTransaction(id: string): Promise<void> {
        try {
            await turso.execute({
                sql: 'DELETE FROM transactions WHERE id = ?',
                args: [id]
            });
        } catch (error) {
            console.error("Turso delete error", error);
            throw error;
        }
    }
}
