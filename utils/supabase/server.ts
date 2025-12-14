// omegle-simple/utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerActionClient() {
    const cookieStore = cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // CORRECCIÓN: Usamos 'as any' para forzar el tipado del objeto cookies
                // Esto elimina el error 'Property get does not exist on type Promise<...>'
                get: (name: string) => (cookieStore as any).get(name)?.value, 
            },
        }
    );
}