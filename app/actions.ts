// omegle-simple/app/actions.ts
'use server';

import { createServerActionClient } from '@/utils/supabase/server'; // Importación del cliente simplificado
import { error } from 'console';

// Tipos de datos para el manejo del resultado de la acción
type StartMatchSuccess = { id: string };
type StartMatchError = { error: 'INSUFFICIENT_TOKENS' | 'NO_MATCH_FOUND' | 'DATABASE_ERROR' | 'UNAUTHORIZED' };
type StartMatchResult = StartMatchSuccess | StartMatchError;

/**
 * Inicia la búsqueda de un match para el usuario actual.
 * @param searchGender El género del usuario que se busca ('male' o 'female').
 */
export async function startMatch(searchGender: 'male' | 'female'): Promise<StartMatchResult> {
    
    // Usamos el cliente simplificado para Server Actions
    const supabase = createServerActionClient();

    // 1. Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'UNAUTHORIZED' };
    }

    // 2. Obtener el perfil del usuario (necesario para el género y tokens)
    const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('gender, tokens')
        .eq('id', user.id)
        .single();
    
    if (profileError || !userProfile) {
        console.error("Error al obtener perfil en startMatch:", profileError);
        return { error: 'DATABASE_ERROR' };
    }

    const { gender: userGender, tokens: userTokens } = userProfile;

    // --- Lógica de Negocio de Tokens ---
    let tokenCost = 0;
    
    // Regla: Los hombres pagan 1 token para chatear con mujeres.
    if (userGender === 'male' && searchGender === 'female') {
        tokenCost = 1;
    }
    
    if (userTokens < tokenCost) {
        return { error: 'INSUFFICIENT_TOKENS' };
    }
    
    // --- Lógica de Búsqueda de Match ---

    // 3. Buscar un usuario target compatible (no el mismo usuario, del género buscado, y no buscando)
    const { data: targetUsers, error: targetError } = await supabase
        .from('profiles')
        .select('id')
        .eq('gender', searchGender)
        .neq('id', user.id)
        .eq('is_searching', true) // Buscar solo a los que están activamente buscando
        .limit(1);

    if (targetError) {
        console.error("Error al buscar usuarios target:", targetError);
        return { error: 'DATABASE_ERROR' };
    }
    
    const targetUser = targetUsers?.[0];

    if (!targetUser) {
        // En un proyecto real, aquí se pondría al usuario en la cola de búsqueda.
        return { error: 'NO_MATCH_FOUND' };
    }
    
    // --- Lógica de Transacción (Creación de Sesión y Débito) ---
    
    const matchId = targetUser.id;
    
    // 4. Transacción (usando RLS/Database Functions para atomicidad en un entorno de producción)
    try {
        await supabase.rpc('create_match_and_debit', {
            matcher_id: user.id,
            matched_id: matchId,
            cost: tokenCost
        });
        
        // El RPC manejará:
        // a) Crear la sesión de match en 'matches'
        // b) Debitar los tokens del perfil del usuario (si cost > 0)
        // c) Opcionalmente: actualizar 'matches_count' e 'is_searching' de ambos perfiles (si es necesario).
        
        return { id: matchId }; // Devuelve el ID del usuario con quien se hizo match (o el ID de la sesión real si la DB lo retorna)
        
    } catch (e) {
        console.error("Error en create_match_and_debit:", e);
        // Si la función RPC falla (ej. por saldo insuficiente si se intentó saltar la verificación JS), retorna error.
        return { error: 'DATABASE_ERROR' }; 
    }
}