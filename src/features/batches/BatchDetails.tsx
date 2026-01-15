import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, TrendingUp, Scale, Sprout, Plus, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import type { Batch, HarvestLog, Transaction } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function BatchDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [harvestLogs, setHarvestLogs] = useState<HarvestLog[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Harvest Form State
    const [harvestWeight, setHarvestWeight] = useState('');
    const [harvestGrade, setHarvestGrade] = useState('A');
    const [isLoggingHarvest, setIsLoggingHarvest] = useState(false);

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (batchId: string) => {
        setIsLoading(true);
        try {
            const [b, logs, allTxs] = await Promise.all([
                db.getBatches().then(res => res.find(i => i.id === batchId) || null),
                db.getHarvestLogs(batchId),
                db.getTransactions()
            ]);

            setBatch(b);
            setHarvestLogs(logs);
            setTransactions(allTxs.filter(t => t.batch_id === batchId));

        } catch (error) {
            console.error("Failed to load batch details", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddHarvest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !harvestWeight) return;

        setIsLoggingHarvest(true);
        try {
            await db.addHarvestLog({
                batch_id: id,
                date: new Date().toISOString().split('T')[0],
                weight_kg: Number(harvestWeight),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                grade: harvestGrade as any,
                notes: ''
            });
            setHarvestWeight('');
            // Refresh logs
            const logs = await db.getHarvestLogs(id);
            setHarvestLogs(logs);
        } catch (error) {
            console.error("Failed to log harvest", error);
            alert("Failed to save harvest log");
        } finally {
            setIsLoggingHarvest(false);
        }
    };

    const deleteHarvest = async (logId: string) => {
        if (!confirm('Delete this harvest log?')) return;
        try {
            await db.deleteHarvestLog(logId);
            setHarvestLogs(harvestLogs.filter(l => l.id !== logId));
        } catch (error) {
            console.error("Failed to delete log", error);
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
    if (!batch) return <div className="p-8">Batch not found</div>;

    // Calculations
    const totalHarvested = harvestLogs.reduce((acc, log) => acc + log.weight_kg, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.debit, 0);
    const revenue = transactions.filter(t => t.type === 'revenue').reduce((acc, t) => acc + t.credit, 0);
    const profit = revenue - expenses;

    // Efficiency: (Yield / Substrate) * 100
    const biologicalEfficiency = batch.substrate_qty && batch.substrate_qty > 0
        ? ((totalHarvested / batch.substrate_qty) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/batches')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{batch.name}</h1>
                    <p className="text-gray-500 text-sm">{batch.type} • {batch.status.toUpperCase()}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4 flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Total Yield</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Scale className="h-5 w-5 text-blue-500" />
                            <span className="text-2xl font-bold">{totalHarvested.toFixed(1)} kg</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Efficiency</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Sprout className="h-5 w-5 text-green-500" />
                            <span className="text-2xl font-bold">{biologicalEfficiency}%</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Net Profit</span>
                        <div className="flex items-center gap-2 mt-1">
                            <TrendingUp className={`h-5 w-5 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                            <span className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{profit.toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-2 lg:col-span-1 border-dashed border-2 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => navigate(`/add?batch=${batch.id}`)}
                >
                    <div className="flex flex-col items-center text-gray-500 py-2">
                        <Plus className="h-6 w-6 mb-1" />
                        <span className="font-semibold text-sm">Add Financial Transaction</span>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left Column: Harvest Logs */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Harvest Logs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Simple Inline Form */}
                            <form onSubmit={handleAddHarvest} className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border">
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs font-medium">Weight (kg)</label>
                                    <Input
                                        type="number" step="0.1"
                                        value={harvestWeight} onChange={e => setHarvestWeight(e.target.value)}
                                        placeholder="0.0"
                                        required
                                    />
                                </div>
                                <div className="space-y-1 w-24">
                                    <label className="text-xs font-medium">Grade</label>
                                    <select
                                        className="w-full h-10 px-2 rounded-md border text-sm"
                                        value={harvestGrade} onChange={e => setHarvestGrade(e.target.value)}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="Waste">Waste</option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={isLoggingHarvest}>
                                    {isLoggingHarvest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </form>

                            {/* List */}
                            <div className="space-y-2">
                                {harvestLogs.length === 0 && <p className="text-gray-400 text-center text-sm">No harvests recorded yet.</p>}
                                {harvestLogs.map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold">{log.weight_kg} kg <span className="text-gray-400 font-normal">• Grade {log.grade}</span></p>
                                            <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600" onClick={() => deleteHarvest(log.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Financials */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Linked Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {transactions.length === 0 && <p className="text-gray-400 text-sm">No expenses or sales linked.</p>}
                                {transactions.map(t => (
                                    <div key={t.id} className="text-sm p-2 border-b last:border-0">
                                        <div className="flex justify-between font-medium">
                                            <span>{t.description}</span>
                                            <span className={t.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                                                {t.type === 'expense' ? '-' : '+'}₹{t.type === 'expense' ? t.debit : t.credit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{new Date(t.date).toLocaleDateString()}</span>
                                            <span>{t.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Revenue</span>
                                    <span className="font-semibold text-green-600">₹{revenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Expenses</span>
                                    <span className="font-semibold text-red-600">₹{expenses.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
