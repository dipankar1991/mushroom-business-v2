export type TransactionType = 'expense' | 'funding' | 'revenue';

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
