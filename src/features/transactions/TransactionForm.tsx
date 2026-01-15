import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { db } from '@/lib/db';
import { TRANSACTION_TYPES, CATEGORIES, COMMON_SUBCATEGORIES, type TransactionType, type Batch } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Validation Schema
const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    type: z.enum(['expense', 'funding', 'revenue'] as [string, ...string[]]),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string(),
    item_description: z.string().min(1, "Description is required"),
    amount: z.coerce.number().min(0.01, "Amount must be positive"),
    notes: z.string().optional(),
    batch_id: z.string().optional(),
    quantity_kg: z.coerce.number().optional(),
    unit_price: z.coerce.number().optional(),
});

type TransactionFormValues = z.infer<typeof formSchema>;

export default function TransactionForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Dropdown Data
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);
    const [activeBatches, setActiveBatches] = useState<Batch[]>([]);

    const form = useForm<TransactionFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            category: '',
            subcategory: '',
            item_description: '',
            amount: 0,
            notes: '',
            batch_id: '',
            quantity_kg: undefined,
            unit_price: undefined
        }
    });

    const { watch, setValue, register, handleSubmit, formState: { errors } } = form;

    const selectedType = watch('type');
    const selectedCategory = watch('category');
    const quantityKg = watch('quantity_kg');
    const unitPrice = watch('unit_price');

    // Auto-calculate Total Amount for Revenue if Qty & Price are present
    useEffect(() => {
        if (selectedType === 'revenue' && quantityKg && unitPrice) {
            const total = quantityKg * unitPrice;
            setValue('amount', total);
        }
    }, [selectedType, quantityKg, unitPrice, setValue]);

    // Load Batches
    useEffect(() => {
        const loadBatches = async () => {
            try {
                const batches = await db.getBatches();
                // Filter for active batches? Or show all?
                // Showing all for now, maybe filter completed ones later or sort them.
                setActiveBatches(batches);
            } catch (error) {
                console.error("Failed to load batches", error);
            }
        };
        loadBatches();
    }, []);

    // Load Edit Data
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId) {
            loadTransaction(editId);
        }
    }, [searchParams]);

    const loadTransaction = async (id: string) => {
        setIsLoading(true);
        try {
            const allTxs = await db.getTransactions();
            const tx = allTxs.find(t => t.id === id);

            if (tx) {
                setValue('date', tx.date);
                setValue('type', tx.type);
                setValue('category', tx.category);
                setValue('subcategory', tx.subcategory || '');
                setValue('item_description', tx.description);

                const amt = tx.type === 'expense' ? tx.debit : tx.credit;
                setValue('amount', amt);
                setValue('notes', tx.notes || '');
                setValue('batch_id', tx.batch_id || '');
                if (tx.quantity_kg) setValue('quantity_kg', tx.quantity_kg);
                if (tx.unit_price) setValue('unit_price', tx.unit_price);
            }
        } catch (error) {
            console.error("Failed to load transaction", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Category Logic
    useEffect(() => {
        const cats = CATEGORIES[selectedType as TransactionType] || [];
        setAvailableCategories(cats);
        if (!cats.includes(selectedCategory)) {
            setValue('category', '');
            setValue('subcategory', '');
        }
    }, [selectedType, setValue, selectedCategory]);

    useEffect(() => {
        if (selectedCategory && COMMON_SUBCATEGORIES[selectedCategory]) {
            setAvailableSubCategories(COMMON_SUBCATEGORIES[selectedCategory]);
        } else {
            setAvailableSubCategories([]);
        }
    }, [selectedCategory]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        setIsLoading(true);
        const editId = searchParams.get('edit');

        try {
            const amountVal = Number(data.amount);
            const isExpense = data.type === 'expense';

            const payload = {
                date: data.date,
                type: data.type as TransactionType,
                category: data.category,
                subcategory: data.subcategory,
                description: data.item_description,
                debit: isExpense ? amountVal : 0,
                credit: isExpense ? 0 : amountVal,
                notes: data.notes || '',
                batch_id: data.batch_id || null,
                quantity_kg: data.quantity_kg || null,
                unit_price: data.unit_price || null,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (editId) await db.updateTransaction(editId, payload as any);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            else await db.addTransaction(payload as any);

            // Navigate back (or to batch details if we came from there)
            if (data.batch_id && searchParams.get('batch')) {
                navigate(`/batches/${data.batch_id}`);
            } else {
                navigate('/transactions');
            }
        } catch (error: any) {
            console.error("Error saving transaction:", error);
            alert(`Failed to save transaction`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-none border-0 sm:border">
            <CardHeader>
                <CardTitle>
                    {searchParams.get('edit') ? 'Edit Transaction' : 'New Transaction'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Batch Link */}
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                        <label className="text-sm font-medium text-blue-800">Assign to Batch (Optional)</label>
                        <select
                            {...register('batch_id')}
                            className="flex h-10 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm mt-1"
                        >
                            <option value="">-- No Batch --</option>
                            {activeBatches.map(b => (
                                <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-blue-600 mt-1">
                            Link expenses (like Spawn/Substrate) or Revenue to a specific grow cycle.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" {...register('date')} />
                            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                {...register('type')}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                                {TRANSACTION_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            {...register('category')}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">Select Category</option>
                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sub-Category</label>
                        <select
                            {...register('subcategory')}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">Select or Type in Notes</option>
                            {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input placeholder="e.g. 50kg Wheat Straw" {...register('item_description')} />
                        {errors.item_description && <p className="text-xs text-red-500">{errors.item_description.message}</p>}
                    </div>

                    {/* Sales Specific Fields */}
                    {selectedType === 'revenue' && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded-md border border-green-100">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity (kg)</label>
                                <Input type="number" step="0.1" {...register('quantity_kg')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price/kg</label>
                                <Input type="number" step="1" {...register('unit_price')} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Total Amount (₹)</label>
                        <Input type="number" step="0.01" {...register('amount')} />
                        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                            {...register('notes')}
                            className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Transaction'}
                    </Button>

                </form>
            </CardContent>
        </Card>
    );
}
