import { turso } from '@/lib/tursoClient';
import type { DatabaseAdapter } from '../types';
import type { Transaction, Batch, HarvestLog } from '@/lib/constants';

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

    // --- Batches ---

    async getBatches(): Promise<Batch[]> {
        try {
            const result = await turso.execute('SELECT * FROM batches ORDER BY start_date DESC');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result.rows.map((row: any) => ({
                ...row,
                substrate_qty: row.substrate_qty ? Number(row.substrate_qty) : undefined,
                spawn_qty: row.spawn_qty ? Number(row.spawn_qty) : undefined,
                total_cost: row.total_cost ? Number(row.total_cost) : 0
            })) as Batch[];
        } catch (error) {
            console.error('Turso getBatches error:', error);
            throw error;
        }
    }

    async addBatch(batch: Omit<Batch, 'id' | 'created_at'>): Promise<Batch | null> {
        try {
            const id = crypto.randomUUID();
            const created_at = new Date().toISOString();

            const sql = `
          INSERT INTO batches (
            id, name, status, type, start_date, target_harvest_date, actual_harvest_date,
            substrate_type, substrate_qty, spawn_type, spawn_qty, total_cost, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *;
        `;

            const args = [
                id, batch.name, batch.status, batch.type, batch.start_date, batch.target_harvest_date,
                batch.actual_harvest_date || null, batch.substrate_type || null, batch.substrate_qty || null,
                batch.spawn_type || null, batch.spawn_qty || null, batch.total_cost || 0, batch.notes || null,
                created_at
            ];

            const result = await turso.execute({ sql, args });
            if (result.rows.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return result.rows[0] as any as Batch; // Simplified cast
            }
            return null;

        } catch (error) {
            console.error("Turso addBatch error", error);
            throw error;
        }
    }

    async updateBatch(id: string, batch: Partial<Batch>): Promise<Batch | null> {
        const sets: string[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args: any[] = [];

        Object.entries(batch).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'created_at' && value !== undefined) {
                sets.push(`${key} = ?`);
                args.push(value);
            }
        });

        if (sets.length === 0) return null;
        args.push(id);

        const sql = `UPDATE batches SET ${sets.join(', ')} WHERE id = ? RETURNING *;`;

        try {
            const result = await turso.execute({ sql, args });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result.rows.length > 0 ? (result.rows[0] as any as Batch) : null;
        } catch (error) {
            console.error("Turso updateBatch error", error);
            throw error;
        }
    }

    async deleteBatch(id: string): Promise<void> {
        try {
            await turso.execute({ sql: 'DELETE FROM batches WHERE id = ?', args: [id] });
        } catch (error) {
            console.error("Turso deleteBatch error", error);
            throw error;
        }
    }

    // --- Harvest Logs ---

    async getHarvestLogs(batchId: string): Promise<HarvestLog[]> {
        try {
            const result = await turso.execute({
                sql: 'SELECT * FROM harvest_logs WHERE batch_id = ? ORDER BY date DESC',
                args: [batchId]
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result.rows.map((row: any) => ({
                ...row,
                weight_kg: Number(row.weight_kg)
            })) as HarvestLog[];
        } catch (error) {
            console.error("Turso getHarvestLogs error", error);
            throw error;
        }
    }

    async addHarvestLog(log: Omit<HarvestLog, 'id' | 'created_at'>): Promise<HarvestLog | null> {
        try {
            const id = crypto.randomUUID();
            const created_at = new Date().toISOString();

            const sql = `
            INSERT INTO harvest_logs (id, batch_id, date, weight_kg, grade, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *;
        `;
            const args = [id, log.batch_id, log.date, log.weight_kg, log.grade, log.notes || null, created_at];

            const result = await turso.execute({ sql, args });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result.rows.length > 0 ? (result.rows[0] as any as HarvestLog) : null;

        } catch (error) {
            console.error("Turso addHarvestLog error", error);
            throw error;
        }
    }

    async deleteHarvestLog(id: string): Promise<void> {
        try {
            await turso.execute({ sql: 'DELETE FROM harvest_logs WHERE id = ?', args: [id] });
        } catch (error) {
            console.error("Turso deleteHarvestLog error", error);
            throw error;
        }
    }
}
