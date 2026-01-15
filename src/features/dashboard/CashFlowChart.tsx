import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CashFlowChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cash Flow History</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip />
                            <Legend verticalAlign="top" height={36} />
                            <Bar yAxisId="left" dataKey="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar yAxisId="left" dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar yAxisId="left" dataKey="Funding" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} name="Capital Infused" />
                            <Line yAxisId="right" type="monotone" dataKey="Profit" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Cum. Profit" />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        No data to display yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
