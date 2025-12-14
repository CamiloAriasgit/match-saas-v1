// omegle-simple/app/match/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client'; // Asumimos que tienes un cliente simple
import GenderSelection from './gender-selection';
import MatchInterface from './match-interface';

// Tipos, movidos del Server Component
type ProfileFromDB = {
    id: string;
    gender: 'male' | 'female' | null; 
    tokens: number;
    matches_count: number;
    is_searching: boolean;
};
type ValidatedProfile = {
    gender: 'male' | 'female';
    tokens: number;
    matches_count: number;
    is_searching: boolean;
};

// Componente principal (ahora Client Component)
export default function MatchPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileFromDB | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchProfile = useCallback(async (id: string) => {
        setUserId(id);
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single() as { data: ProfileFromDB | null, error: any };
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = No Rows Found
            console.error("Error al cargar perfil:", error);
        }
        setProfile(profileData);
        setLoading(false);
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Redirigir si no hay sesión (Ahora es un Client Component)
                router.push('/login');
                return;
            }
            // Si hay usuario, cargar el perfil
            fetchProfile(user.id);
        };

        checkUser();
        
        // Listener para refrescar la página si el usuario cambia (ej. después de login/logout)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login');
            } else if (event === 'SIGNED_IN' && session) {
                fetchProfile(session.user.id);
            }
        });
        
        return () => {
            authListener?.subscription.unsubscribe();
        };

    }, [router, fetchProfile]);

    if (loading) {
        return <div className="min-h-screen bg-purple-950 flex items-center justify-center">Cargando perfil...</div>;
    }
    
    // Si no tiene perfil o no tiene género (primer login)
    if (userId && (!profile || !profile.gender)) {
        return <GenderSelection userId={userId} />;
    }
    
    // Si el perfil está completo, mostrar interfaz de match
    if (profile && profile.gender) {
        return (
            <div className="min-h-screen bg-purple-950 flex items-center justify-center p-4">
                <MatchInterface 
                    initialProfile={profile as ValidatedProfile} 
                    userId={userId!} 
                />
            </div>
        );
    }
    
    // Fallback
    return null; 
}