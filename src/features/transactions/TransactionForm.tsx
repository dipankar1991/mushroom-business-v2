import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { db } from '@/lib/db';
import { TRANSACTION_TYPES, CATEGORIES, COMMON_SUBCATEGORIES, type TransactionType } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Validation Schema
const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    type: z.enum(['expense', 'funding', 'revenue'] as [string, ...string[]]),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string(), // Optional, but usually good to have
    item_description: z.string().min(1, "Description is required"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof formSchema>;

export default function TransactionForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0], // Today
            type: 'expense',
            category: '',
            subcategory: '',
            item_description: '',
            amount: '',
            notes: ''
        }
    });

    const { watch, setValue, register, handleSubmit, formState: { errors } } = form;

    const selectedType = watch('type');
    const selectedCategory = watch('category');

    // Update categories when Type changes
    useEffect(() => {
        const cats = CATEGORIES[selectedType as TransactionType] || [];
        setAvailableCategories(cats);
        // Reset sub selections
        if (!cats.includes(selectedCategory)) {
            setValue('category', '');
            setValue('subcategory', '');
        }
    }, [selectedType, setValue, selectedCategory]);

    // Update sub-categories when Category changes
    useEffect(() => {
        if (selectedCategory && COMMON_SUBCATEGORIES[selectedCategory]) {
            setAvailableSubCategories(COMMON_SUBCATEGORIES[selectedCategory]);
        } else {
            setAvailableSubCategories([]);
        }
    }, [selectedCategory]);

    // Edit Mode Logic
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const editId = searchParams.get('edit');
        if (editId) {
            loadTransaction(editId);
        }
    }, []);

    const loadTransaction = async (id: string) => {
        setIsLoading(true);
        try {
            const allTxs = await db.getTransactions();
            const tx = allTxs.find(t => t.id === id);

            if (tx) {
                // Populate Form
                setValue('date', tx.date);
                setValue('type', tx.type);
                setValue('category', tx.category);
                setValue('subcategory', tx.subcategory || '');
                setValue('item_description', tx.description);

                const amt = tx.type === 'expense' ? tx.debit : tx.credit;
                setValue('amount', String(amt));
                setValue('notes', tx.notes || '');
            } else {
                alert("Transaction not found");
                navigate('/transactions');
            }
        } catch (error) {
            console.error("Failed to load transaction", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: TransactionFormValues) => {
        setIsLoading(true);
        const searchParams = new URLSearchParams(window.location.search);
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
            };

            if (editId) {
                await db.updateTransaction(editId, payload);
            } else {
                await db.addTransaction(payload);
            }

            navigate('/transactions'); // Go to list after success
        } catch (error: any) {
            console.error("Error saving transaction:", error);
            alert(`Failed to save transaction: ${error.message || error.details || "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-none border-0 sm:border">
            <CardHeader>
                <CardTitle>
                    {new URLSearchParams(window.location.search).get('edit') ? 'Edit Transaction' : 'New Transaction'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input type="date" {...register('date')} />
                        {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Transaction Type</label>
                        <select
                            {...register('type')}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            {TRANSACTION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            {...register('category')}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="">Select Category</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                    </div>

                    {/* Sub-Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sub-Category</label>
                        <div className="flex gap-2">
                            <select
                                {...register('subcategory')}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                <option value="">Select or Type (in notes)</option>
                                {availableSubCategories.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <p className="text-[10px] text-gray-500">Dependent on Category.</p>
                    </div>

                    {/* Item Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Item Description</label>
                        <Input placeholder="e.g. 50kg Wheat Straw" {...register('item_description')} />
                        {errors.item_description && <p className="text-xs text-red-500">{errors.item_description.message}</p>}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input type="number" step="0.01" placeholder="0.00" {...register('amount')} />
                        {watch('amount') && (
                            <p className="text-xs font-semibold">
                                Will be recorded as: <span className={selectedType === 'expense' ? 'text-red-600' : 'text-green-600'}>
                                    {selectedType === 'expense' ? 'DEBIT' : 'CREDIT'}
                                </span>
                            </p>
                        )}
                        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (Optional)</label>
                        <textarea
                            {...register('notes')}
                            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="Additional details..."
                        />
                    </div>

                    <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (new URLSearchParams(window.location.search).get('edit') ? 'Update Transaction' : 'Save Transaction')}
                    </Button>

                </form>
            </CardContent>
        </Card>
    );
}
