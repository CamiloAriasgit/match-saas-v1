// omegle-simple/app/page.tsx
import Link from 'next/link';
// No se requiere ninguna importación de Supabase (createServerClient, etc.) ni de 'next/navigation' (redirect)

/**
 * Landing Page Estable y Simple (Ruta Raíz: /).
 * Es un Server Component simple que muestra la interfaz pública y redirige a /login.
 */
export default function LandingPageSimple() {
  
  return (
    <div className="min-h-screen pt-30 bg-gradient-to-r from-purple-950 to-indigo-950 flex flex-col items-center justify-center p-4 font-sans">

      {/* Título y Propuesta de Valor */}
      <header className="text-center mb-12">
        <h1 className="text-3xl font-extrabold shadow-2xl shadow-fuchsia-600 text-indigo-500 mb-4 tracking-tight">
          <span className='text-purple-500'>i</span>Match
        </h1>
        <p className="text-xl text-neutral-200 max-w-3xl mx-auto font-light">
          El lugar donde las conversaciones comienzan de forma inesperada.
        </p>
      </header>

      {/* Sección de Llamada a la Acción (CTA) */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pb-20">
        
        {/* Botón Principal: Iniciar Sesión (dirige a la ruta que ya tiene la lógica de redirección) */}
        <Link href="/login" passHref>
          <button className="w-64 px-8 py-4 text-xl font-bold text-white bg-purple-600 rounded-xl shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300">
            Comenzar Chat
          </button>
        </Link>

        {/* Botón Secundario: Registro */}
        <Link href="/signup" passHref>
          <button className="w-64 px-8 py-4 text-xl font-bold text-white bg-indigo-700 rounded-xl shadow-lg hover:bg-indigo-800 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300">
            Regístrate gratis
          </button>
        </Link>
      </div>

      {/* Beneficios */}
      <section className="mt-20 w-full max-w-4xl text-center">
        <h2 className="text-3xl font-semibold text-indigo-500 mb-8">
          ¿Por qué usar <span className='text-purple-500'>i</span>Match?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BenefitCard title="Anonimato Total" description="Inicia chats sin revelar información personal hasta que tú lo decidas." icon="🤫" />
          <BenefitCard title="Filtros Inteligentes" description="Usa Tokens para saltar la línea y chatear con usuarios según tu preferencia." icon="🧠" />
          <BenefitCard title="Conexiones Globales" description="Amplía tu círculo social más allá de tu región." icon="🌍" />
        </div>
      </section>

      {/* Pie de página simple */}
      <footer className="mt-20 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Match-SAAS. Todos los derechos reservados.
      </footer>
    </div>
  );
}

// Componente auxiliar para las tarjetas de beneficios
function BenefitCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="bg-purple-900 p-6 rounded-lg shadow-xl hover:shadow-2xl hover:bg-purple-800 transition duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-indigo-500 mb-2 hover:text-indigo-700">{title}</h3>
      <p className="text-neutral-200">{description}</p>
    </div>
  );
}