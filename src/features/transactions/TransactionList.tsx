import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TRANSACTION_TYPES } from '@/lib/constants';

interface Transaction {
    id: string;
    created_at: string;
    date: string;
    type: string;
    category: string;
    subcategory: string;
    description: string;
    amount: number;
    notes: string;
}

export default function TransactionList() {
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
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // In a real app, show a toast. For now, maybe just log or show empty.
        } finally {
            setIsLoading(false);
        }
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

                {/* Search and Filter */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <select
                        className="rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All</option>
                        {TRANSACTION_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
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
                        <Card key={t.id} className="overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-gray-900">{t.description}</span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{format(new Date(t.date), 'MMM dd, yyyy')}</span>
                                        <span>•</span>
                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{t.category}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "font-bold text-sm",
                                    t.type === 'expense' ? "text-red-600" : "text-green-600"
                                )}>
                                    {t.type === 'expense' ? '-' : '+'}
                                    ₹{Number(t.amount).toFixed(2)}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
