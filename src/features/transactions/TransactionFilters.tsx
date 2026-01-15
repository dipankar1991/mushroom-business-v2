import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { TRANSACTION_TYPES } from '@/lib/constants';

interface TransactionFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    filterType: string;
    setFilterType: (val: string) => void;
    startDate: string;
    setStartDate: (val: string) => void;
    endDate: string;
    setEndDate: (val: string) => void;
}

export function TransactionFilters({
    searchTerm, setSearchTerm,
    filterType, setFilterType,
    startDate, setStartDate,
    endDate, setEndDate
}: TransactionFiltersProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <select
                    className="rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10 bg-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">All Types</option>
                    {TRANSACTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2 items-center">
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm"
                />
                <span className="text-gray-400">-</span>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm"
                />
            </div>
        </div>
    );
}
