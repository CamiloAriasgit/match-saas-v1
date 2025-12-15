// omegle-simple/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// La ruta a la que debe ir el usuario si no está autenticado
const LOGIN_URL = '/login'; 
// La ruta de la aplicación principal
const MATCH_URL = '/match'; 

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Crea el cliente Supabase dentro del middleware para manejar la sesión
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // ... (Tu configuración de cookies que funciona)
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 1. Refresca la sesión del usuario
  await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Lógica de Redirección (Mantenida, porque ahora el matcher la ignorará en /)
  const path = request.nextUrl.pathname;

  if (!user && path !== LOGIN_URL) {
    // Si no está logueado y no está en la página de login, redirige a login
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  if (user && path === LOGIN_URL) {
    // Si está logueado y está en la página de login, redirige a la app principal
    return NextResponse.redirect(new URL(MATCH_URL, request.url));
  }

  return response;
}

// 🛑 ¡CORRECCIÓN AQUÍ! EXCLUIMOS LA RUTA RAÍZ (/)
export const config = {
  // Aplicar el middleware a todas las rutas excepto a las APIs, estáticos, y la raíz (/)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|\\.svg|\\.png|\\.jpg|\\.jpeg|\\.gif|\\.webp|/$).*)',
  ],
};