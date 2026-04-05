import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email;

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-espresso px-6 py-4 flex items-center justify-between">
        <Image src="/logo.svg" alt="Aura Digital" width={140} height={56} />
        <div className="flex items-center gap-4">
          <span className="text-sand text-sm">{name}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-clay hover:text-terra transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-espresso mb-2">
          Bienvenido, {name}
        </h1>
        <p className="text-clay mb-8">
          Aquí podrás ver tus métricas, reportes y contenido.
        </p>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg bg-white border border-sand p-6">
            <div className="text-terra text-2xl font-bold mb-1">—</div>
            <div className="text-sm text-clay">Seguidores IG</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-6">
            <div className="text-terra text-2xl font-bold mb-1">—</div>
            <div className="text-sm text-clay">Alcance (30d)</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-6">
            <div className="text-terra text-2xl font-bold mb-1">—</div>
            <div className="text-sm text-clay">Engagement</div>
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-sand bg-white p-8 text-center">
          <Image src="/icon.svg" alt="" width={40} height={40} className="mx-auto mb-4" />
          <p className="text-clay text-sm">
            Las métricas de Instagram se conectarán próximamente.
          </p>
        </div>
      </main>
    </div>
  );
}
