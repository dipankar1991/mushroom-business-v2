import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const formSchema = z.object({
    name: z.string().min(1, "Batch Name is required"),
    mushroom_type: z.string().min(1, "Type is required"),
    status: z.enum(['preparation', 'inoculation', 'incubation', 'fruiting', 'harvesting', 'completed'] as [string, ...string[]]),
    start_date: z.string().min(1, "Start Date is required"),
    target_harvest_date: z.string().min(1, "Target Harvest Date is required"),
    substrate_type: z.string().optional(),
    substrate_qty: z.string().optional(), // Input as string, convert to number
    spawn_type: z.string().optional(),
    spawn_qty: z.string().optional(),     // Input as string, convert to number
    notes: z.string().optional(),
});

type BatchFormValues = z.infer<typeof formSchema>;

const MUSHROOM_TYPES = ['Oyster', 'Button', 'Shiitake', 'Lion\'s Mane', 'Milky', 'Paddy Straw', 'Other'];
const SUBSTRATE_TYPES = ['Wheat Straw', 'Paddy Straw', 'Sawdust', 'Sugar Cane Bagasse', 'Other'];
const STATUSES = ['preparation', 'inoculation', 'incubation', 'fruiting', 'harvesting', 'completed'];

export default function BatchForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BatchFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            mushroom_type: 'Oyster',
            status: 'preparation',
            start_date: new Date().toISOString().split('T')[0],
            target_harvest_date: '',
            substrate_type: 'Wheat Straw',
            substrate_qty: '',
            spawn_type: 'Grain Spawn',
            spawn_qty: '',
            notes: ''
        }
    });

    const { register, handleSubmit, formState: { errors } } = form;

    const onSubmit = async (data: BatchFormValues) => {
        setIsLoading(true);
        try {
            await db.addBatch({
                name: data.name,
                type: data.mushroom_type,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: data.status as any,
                start_date: data.start_date,
                target_harvest_date: data.target_harvest_date,
                substrate_type: data.substrate_type,
                substrate_qty: data.substrate_qty ? Number(data.substrate_qty) : 0,
                spawn_type: data.spawn_type,
                spawn_qty: data.spawn_qty ? Number(data.spawn_qty) : 0,
                notes: data.notes
            });
            navigate('/batches');
        } catch (error) {
            console.error("Error creating batch:", error);
            alert("Failed to create batch");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-none border-0 sm:border">
            <CardHeader>
                <CardTitle>New Batch Production</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Batch Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Batch ID/Name</label>
                        <Input className="h-8 text-xs py-1" placeholder="e.g. OYSTER-OCT-001" {...register('name')} />
                        {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Type */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Mushroom Type</label>
                            <select
                                {...register('mushroom_type')}
                                className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                            >
                                {MUSHROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        {/* Status */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Current Status</label>
                            <select
                                {...register('status')}
                                className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Start Date</label>
                            <Input type="date" className="h-8 text-xs py-1" {...register('start_date')} />
                            {errors.start_date && <p className="text-[10px] text-red-500">{errors.start_date.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Target Harvest</label>
                            <Input type="date" className="h-8 text-xs py-1" {...register('target_harvest_date')} />
                            {errors.target_harvest_date && <p className="text-[10px] text-red-500">{errors.target_harvest_date.message}</p>}
                        </div>
                    </div>

                    {/* Substrate Info */}
                    <div className="p-2 bg-gray-50 rounded-md space-y-2">
                        <h4 className="text-[10px] font-semibold uppercase text-gray-500">Substrate & Spawn</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Substrate Type</label>
                                <select
                                    {...register('substrate_type')}
                                    className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                >
                                    {SUBSTRATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Qty (kg)</label>
                                <Input type="number" step="0.1" className="h-8 text-xs py-1" {...register('substrate_qty')} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Spawn Used</label>
                                <Input className="h-8 text-xs py-1" placeholder="e.g. Wheat Grain" {...register('spawn_type')} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Qty (kg)</label>
                                <Input type="number" step="0.1" className="h-8 text-xs py-1" {...register('spawn_qty')} />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Notes</label>
                        <textarea
                            {...register('notes')}
                            className="flex min-h-[40px] w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                            placeholder="Details..."
                        />
                    </div>

                    <Button type="submit" className="w-full h-9 text-xs bg-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : 'Create Batch'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
