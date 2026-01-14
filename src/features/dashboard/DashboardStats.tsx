import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

interface DashboardStatsProps {
    summary: {
        balance: number;
        income: number;
        expense: number;
        funding: number;
    };
}

export function DashboardStats({ summary }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.balance < 0 ? 'text-red-600' : 'text-primary'}`}>
                        ₹{summary.balance.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">Total Cash (Inc. Fund)</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">+₹{summary.income.toFixed(2)}</div>
                    <p className="text-xs text-gray-500">Sales Only</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Funding</CardTitle>
                    <IndianRupee className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">+₹{summary.funding.toFixed(2)}</div>
                    <p className="text-xs text-gray-500">Investments/Loans</p>
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
    );
}
