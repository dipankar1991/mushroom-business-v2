import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Sprout } from 'lucide-react';
import { db } from '@/lib/db';
import type { Batch } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function BatchList() {
    const navigate = useNavigate();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = async () => {
        try {
            const data = await db.getBatches();
            setBatches(data);
        } catch (error) {
            console.error("Failed to load batches", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: Batch['status']) => {
        switch (status) {
            case 'preparation': return 'bg-gray-100 text-gray-800';
            case 'inoculation': return 'bg-blue-100 text-blue-800';
            case 'incubation': return 'bg-purple-100 text-purple-800';
            case 'fruiting': return 'bg-green-100 text-green-800';
            case 'harvesting': return 'bg-orange-100 text-orange-800';
            case 'completed': return 'bg-slate-100 text-slate-800 line-through decoration-slate-400';
            default: return 'bg-gray-100';
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Batches</h1>
                <Button onClick={() => navigate('/batches/new')}>
                    <Plus className="mr-2 h-4 w-4" /> New Batch
                </Button>
            </div>

            {batches.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed text-sm">
                    <Sprout className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    No active batches. Start one to track your growth!
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <Card
                            key={batch.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/batches/${batch.id}`)}
                        >
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg">{batch.name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${getStatusColor(batch.status)}`}>
                                        {batch.status}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 grid grid-cols-2 gap-1 mt-2">
                                    <div>
                                        <p className="text-xs text-gray-400">Type</p>
                                        <p>{batch.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Started</p>
                                        <p>{new Date(batch.start_date).toLocaleDateString()}</p>
                                    </div>

                                    <div className="col-span-2 pt-2 border-t mt-1 flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-400">Target Harvest</p>
                                            <p className="font-medium text-green-700">{new Date(batch.target_harvest_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
