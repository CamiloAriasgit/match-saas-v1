// omegle-simple/app/login/page.tsx
'use client'

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setMessage('');

    let error; 
    
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    }

    if (error) {
      // Usamos 'as any' para manejar el error de tipado en 'message' (solución anterior)
      setMessage(`Error: ${(error as any).message}`); 
    } else {
      setMessage(isSignUp ? '¡Registro exitoso! Redirigiendo...' : 'Inicio de sesión exitoso. Redirigiendo...');
      
      // SOLUCIÓN AL BUCLÉ DE REDIRECCIÓN: Forzamos la actualización de la sesión
      router.refresh(); 
      router.push('/match');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Inicia Sesión o Regístrate
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Acceso rápido, solo necesitamos tu email y contraseña.
        </p>
        
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-4"
        />
        
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-6"
        />

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => handleAuth(false)}
            disabled={loading || !email || !password}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
          >
            {'Iniciar Sesión'}
          </button>
          <button
            onClick={() => handleAuth(true)}
            disabled={loading || !email || !password}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
          >
            {'Registrarme'}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}