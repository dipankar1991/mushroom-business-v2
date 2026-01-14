import { createClient } from '@libsql/client';

const url = import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!url) {
    console.error("VITE_TURSO_DATABASE_URL is not set!");
}

export const turso = createClient({
    url: url || 'file:local.db', // Fallback for safety, though env is expected
    authToken: authToken,
});
