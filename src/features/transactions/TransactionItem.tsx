import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/constants';
import { Pencil, Trash2 } from 'lucide-react';

interface TransactionItemProps {
    transaction: Transaction;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction: t, onEdit, onDelete }: TransactionItemProps) {
    return (
        <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900">{t.description}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{format(new Date(t.date), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{t.category}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={cn(
                        "font-bold text-sm",
                        t.type === 'expense' ? "text-red-600" : "text-green-600"
                    )}>
                        {t.type === 'expense' ? '-' : '+'}
                        ₹{t.type === 'expense' ? Number(t.debit).toFixed(2) : Number(t.credit).toFixed(2)}
                    </div>

                    {/* Action Buttons (Visible if handlers provided) */}
                    {(onEdit || onDelete) && (
                        <div className="flex gap-1 ml-2">
                            {onEdit && (
                                <button
                                    onClick={() => t.id && onEdit(t.id)}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => t.id && onDelete(t.id)}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
