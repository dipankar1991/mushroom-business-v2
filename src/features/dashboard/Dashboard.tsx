import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/constants';
import { DashboardStats } from './DashboardStats';
import { CashFlowChart } from './CashFlowChart';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState({
        balance: 0,
        income: 0,
        expense: 0,
        funding: 0,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            // Updated to use 'db' instead of direct supabase
            const txs = await db.getTransactions();
            setTransactions(txs);
            calculateStats(txs);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (txs: Transaction[]) => {
        let totalDebit = 0;
        let totalCredit = 0;
        let revenueCredit = 0;
        let fundingCredit = 0;

        // Monthly breakdown map
        const monthlyStats: Record<string, { income: number; expense: number }> = {};

        txs.forEach(t => {
            const debit = Number(t.debit) || 0;
            const credit = Number(t.credit) || 0;

            totalDebit += debit;
            totalCredit += credit;

            if (t.type === 'revenue') {
                revenueCredit += credit;
            }
            if (t.type === 'funding') {
                fundingCredit += credit;
            }

            // Chart - group by month
            if (t.date) {
                const month = t.date.slice(0, 7); // YYYY-MM
                if (!monthlyStats[month]) monthlyStats[month] = { income: 0, expense: 0 };

                if (t.type === 'expense') {
                    monthlyStats[month].expense += debit;
                } else {
                    monthlyStats[month].income += credit;
                }
            }
        });

        // "Current Balance" (Cash on hand)
        const balance = totalCredit - totalDebit;

        setSummary({
            balance: balance,
            income: revenueCredit,     // Strictly Revenue
            expense: totalDebit,       // Total Spent
            funding: fundingCredit     // Separate metric
        });

        // Format chart data
        const sortedMonths = Object.keys(monthlyStats).sort();
        const data = sortedMonths.map(m => ({
            name: m,
            Income: monthlyStats[m].income,
            Expense: monthlyStats[m].expense
        }));
        setChartData(data);
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <DashboardStats summary={summary} />
            <CashFlowChart data={chartData} />
        </div>
    );
}
