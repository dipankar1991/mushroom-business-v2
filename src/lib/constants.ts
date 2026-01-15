export type TransactionType = 'expense' | 'funding' | 'revenue';

export interface Transaction {
    id?: string;
    date: string;
    type: TransactionType;
    category: string;
    subcategory?: string;
    description: string;
    debit: number;
    credit: number;
    notes?: string;
    created_at?: string;
    // V3: Batch Integration
    batch_id?: string;
    quantity_kg?: number;
    unit_price?: number;
}

export interface Batch {
    id: string;
    name: string;
    status: 'preparation' | 'inoculation' | 'incubation' | 'fruiting' | 'harvesting' | 'completed';
    type: string;
    start_date: string;
    target_harvest_date: string;
    actual_harvest_date?: string;
    substrate_type?: string;
    substrate_qty?: number;
    spawn_type?: string;
    spawn_qty?: number;
    total_cost?: number;
    notes?: string;
    created_at?: string;
}

export interface HarvestLog {
    id: string;
    batch_id: string;
    date: string;
    weight_kg: number;
    grade: 'A' | 'B' | 'C' | 'Waste';
    notes?: string;
    created_at?: string;
}

export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
    { value: 'funding', label: 'Funding (In)' },
    { value: 'expense', label: 'Expense (Out)' },
    { value: 'revenue', label: 'Revenue (In)' },
];

export const CATEGORIES: Record<TransactionType, string[]> = {
    funding: ['Owner Investment', 'Loan', 'Grant', 'Other'],
    expense: [
        'Raw Materials', // Spores, substrates
        'Equipment',     // Trays, humifiers
        'Utilities',     // Electricity, water
        'Labor',
        'Packaging',
        'Transportation',
        'Marketing',
        'Rent/Lease',
        'Maintenance',
        'Other'
    ],
    revenue: [
        'Fresh Mushrooms',
        'Dried Mushrooms',
        'Spawn/Substrate Sales',
        'Merchandise',
        'Consulting',
        'Other'
    ]
};

// Map categories to default subcategories if needed, for now just flat strings or user input.
// We will allow free-text input for sub-category or define common ones.
export const COMMON_SUBCATEGORIES: Record<string, string[]> = {
    'Raw Materials': ['Spores', 'Substrate (Straw/Sawdust)', 'Supplements', 'Bags'],
    'Equipment': ['Shelving', 'Humidifiers', 'Fans', 'Heaters', 'Harvesting Tools'],
    'Utilities': ['Water Bill', 'Electricity Bill', 'Internet'],
};
