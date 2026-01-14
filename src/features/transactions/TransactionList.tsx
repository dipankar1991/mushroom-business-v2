import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/constants';
import { TransactionFilters } from './TransactionFilters';
import { TransactionItem } from './TransactionItem';
import { useNavigate } from 'react-router-dom';

export default function TransactionList() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const data = await db.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            // Check if delete is implemented
            if (!db.deleteTransaction) {
                alert("Delete function is not yet implemented for this database provider.");
                return;
            }
            await db.deleteTransaction(id);
            // Refresh
            fetchTransactions();
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete transaction.");
        }
    };

    const handleEdit = (id: string) => {
        navigate(`/add?edit=${id}`);
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filterType === 'all' || t.type === filterType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">History</h2>
                <TransactionFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterType={filterType}
                    setFilterType={setFilterType}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredTransactions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        No transactions found.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((t) => (
                        <TransactionItem
                            key={t.id || Math.random()}
                            transaction={t}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
