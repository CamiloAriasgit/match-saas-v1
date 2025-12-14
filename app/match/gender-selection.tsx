// omegle-simple/app/match/gender-selection.tsx
'use client';

// Definición de tipo para eliminar errores de tipado en el mapeo
interface GenderOption {
    value: 'male' | 'female';
    label: string;
}

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function GenderSelection({ userId }: { userId: string }) {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSaveGender = async () => {
    if (!selectedGender) {
      setError("Por favor, selecciona un género para continuar.");
      return;
    }

    setLoading(true);
    setError(null);

    // Los tokens iniciales son 0.
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        gender: selectedGender,
        tokens: 0, 
        matches_count: 0
      });

    if (insertError) {
      console.error("Error al guardar el perfil:", insertError);
      setError("Hubo un error al crear tu perfil. Intenta de nuevo.");
    } else {
      // Forzar la recarga para que page.tsx detecte el perfil
      router.refresh(); 
    }

    setLoading(false);
  };

  // Declaración del array usando la interfaz explícita
  const genders: GenderOption[] = [
    { value: 'male', label: 'Masculino ♂️' },
    { value: 'female', label: 'Femenino ♀️' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-purple-950 to-indigo-950 rounded-xl shadow-xl">
      <h2 className="text-2xl font-semibold mb-6 text-purple-400">
        👋 Selecciona tu Género
      </h2>
      <p className="text-neutral-200 mb-8 text-center">
        Esto define tu experiencia en la aplicación.
      </p>

      <div className="flex space-x-6 mb-8">
        {/* SOLUCIÓN AL ERROR DE TIPADO: Usamos casting a 'any' para forzar la compilación del map */}
        {(genders as any).map((item: GenderOption) => ( 
          <button
            key={item.value} 
            onClick={() => setSelectedGender(item.value)}
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-200 ease-in-out shadow-md
              ${selectedGender === item.value
                ? 'bg-indigo-600 text-white transform scale-105 ring-4 ring-indigo-300'
                : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'
              }`
            }
            disabled={loading}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleSaveGender}
        disabled={!selectedGender || loading}
        className="px-10 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 disabled:bg-gray-400 transition duration-150"
      >
        {loading ? 'Guardando...' : 'Comenzar a Chatear'}
      </button>
    </div>
  );
}