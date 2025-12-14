// omegle-simple/app/match/match-interface.tsx
'use client';

import { useState } from 'react';
import { startMatch } from '@/app/actions'; 
import { useRouter } from 'next/navigation';

// ESTA ES LA DEFINICIÓN CORREGIDA: No incluye 'id' ni '| null' en gender.
type Profile = {
  gender: 'male' | 'female';
  tokens: number;
  matches_count: number;
  is_searching: boolean; // Asegúrate de incluir esta propiedad si existe en tu DB
}

export default function MatchInterface({ initialProfile, userId }: { initialProfile: Profile, userId: string }) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleMatch = async (searchGender: 'male' | 'female') => {
    setLoading(true);
    setStatusMessage(`Buscando match con ${searchGender === 'male' ? 'Hombres' : 'Mujeres'}...`);

    const result = await startMatch(searchGender);

    if ('error' in result) {
      // Manejo de Errores de Negocio
      if (result.error === 'INSUFFICIENT_TOKENS') {
        setStatusMessage("❌ No tienes tokens suficientes para chatear con una mujer.");
      } else if (result.error === 'NO_MATCH_FOUND') {
        setStatusMessage("🤷‍♂️ No se encontró un match disponible. Intenta de nuevo.");
      } else {
        setStatusMessage(`Error: ${result.error}. No se pudo iniciar el match.`);
      }
    } else {
      // Éxito: Match iniciado
      setStatusMessage(`✅ Match exitoso! ID de Sesión: ${result.id}.`);
      
      // La lógica de Realtime para iniciar el chat irá aquí
      
      router.refresh(); 
    }

    setLoading(false);
  };
  
  const genderIcon = initialProfile.gender === 'male' ? 'Masculino ♂️' : 'Femenino ♀️';
  
  return (
    <div className="bg-purple-900 p-6 rounded-xl shadow-2xl border border-purple-500">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 text-purple-400">
        Tu Perfil
      </h2>
      
      <div className="text-sm text-purple-100 mb-6 pb-4">
        <p>
          Género: <span className="text-indigo-500 font-semibold">{genderIcon}</span>
        </p>
        {initialProfile.gender === 'male' && (
          <p>
            Tokens Disponibles: <span className="text-lime-400 font-bold text-lg">{initialProfile.tokens} 🪙</span>
          </p>
        )}
        <p>
            Matches Iniciados (Bono): {initialProfile.matches_count}
        </p>
      </div>

      <div className="h-auto flex flex-col items-center justify-center bg-purple-950 rounded-lg mb-6 p-4">
        <p className="text-purple-500 italic mb-4">
          Estado: {loading ? 'Cargando...' : statusMessage || 'Listo para buscar un match.'}
        </p>
        
        <div className='space-y-2 w-full max-w-sm'>
            {initialProfile.gender === 'male' && (
              <>
                <button 
                  onClick={() => handleMatch('male')}
                  disabled={loading}
                  className='w-full py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300'
                >
                    Chat aleatorio (Gratis)
                </button>
                <button 
                  onClick={() => handleMatch('female')}
                  disabled={loading || initialProfile.tokens === 0}
                  className='w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-pink-300'
                >
                    Chatear con una Mujer (1 Token)
                </button>
              </>
            )}
            {initialProfile.gender === 'female' && (
                 <button 
                  onClick={() => handleMatch('male')} // Las mujeres solo buscan Hombres por lógica de negocio
                  disabled={loading}
                  className='w-full py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300'
                >
                    Chatea con un hombre (Gratis)
                </button>
            )}
        </div>
      </div>
      
      {/* Botones de desconexión (aún no funcionales) */}
      <div className="flex justify-between space-x-4">
        <button className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">
          ❌ Desconectar
        </button>
        <button className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600">
          🔄 Nuevo Match
        </button>
      </div>
    </div>
  );
}