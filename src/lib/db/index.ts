import { SupabaseAdapter } from './adapters/SupabaseAdapter';
import { TursoAdapter } from './adapters/TursoAdapter';
import { GoogleSheetsAdapter } from './adapters/GoogleSheetsAdapter';
import type { DatabaseAdapter } from './types';

// Factory to get the correct provider
const provider = import.meta.env.VITE_DB_PROVIDER || 'supabase';

let adapter: DatabaseAdapter;

switch (provider) {
    case 'turso':
        adapter = new TursoAdapter();
        break;
    case 'sheets':
        adapter = new GoogleSheetsAdapter();
        break;
    case 'supabase':
    default:
        adapter = new SupabaseAdapter();
        break;
}

export const db = adapter;
