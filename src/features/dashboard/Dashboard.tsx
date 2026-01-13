import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

interface Transaction {
    amount: number;
    type: 'expense' | 'funding' | 'revenue';
    date: string;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        balance: 0,
        income: 0,
        expense: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('amount, type, date');

                if (error) throw error;
                calculateStats(data as Transaction[]);
            } catch (e) {
                console.error("Dashboard error:", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const calculateStats = (transactions: Transaction[]) => {
        let income = 0;
        let expense = 0;
        let balance = 0;

        // Monthly breakdown map
        const monthlyStats: Record<string, { income: number; expense: number }> = {};

        transactions.forEach(t => {
            const val = Number(t.amount);
            if (t.type === 'expense') {
                expense += val;
                balance -= val;
            } else {
                // Funding + Revenue = Income flow for balance
                income += val; // Wait, funding is funding. Revenue is revenue. Usually Income = Revenue. Funding is separate.
                // For "Balance": Balance = (Funding + Revenue) - Expense.
                balance += val;
            }

            // Chart - group by month
            const month = t.date.slice(0, 7); // YYYY-MM
            if (!monthlyStats[month]) monthlyStats[month] = { income: 0, expense: 0 };

            if (t.type === 'expense') {
                monthlyStats[month].expense += val;
            } else {
                // Group Funding and Revenue together as 'In' for simple chart, or separate?
                // Let's group them as Income for the chart to show Cash Flow.
                monthlyStats[month].income += val;
            }
        });

        setSummary({ balance, income, expense });

        // Format chart data
        const sortedMonths = Object.keys(monthlyStats).sort();
        // specific 2026 handling :)
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                        <IndianRupee className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.balance < 0 ? 'text-red-600' : 'text-primary'}`}>
                            ₹{summary.balance.toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-500">Net Cash Position</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+₹{summary.income.toFixed(2)}</div>
                        <p className="text-xs text-gray-500">Revenue & Funding</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-₹{summary.expense.toFixed(2)}</div>
                        <p className="text-xs text-gray-500">Spent to date</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Cash Flow History</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip />
                                <Bar dataKey="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            No data to display yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
