import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, slug, full_name, email, created_at")
    .eq("id", id)
    .single();

  if (!client) {
    redirect("/admin");
  }

  // Get onboarding
  const { data: onboarding } = await supabase
    .from("client_onboarding")
    .select("completed_at, completed_sections, updated_at")
    .eq("client_id", id)
    .single();

  // Get connections
  const { data: apps } = await supabase
    .from("client_apps")
    .select("app_name, app_username, app_account_id, connected_at, metadata")
    .eq("client_id", id);

  // Get IG profile
  const { data: igProfile } = await supabase
    .from("instagram_profiles")
    .select("username, followers_count, media_count, updated_at")
    .eq("client_id", id)
    .single();

  const igApp = (apps || []).find((a) => a.app_name === "instagram");

  const sections = [
    {
      title: "Conexiones",
      description: "Estado de las redes sociales conectadas y gestión de invitaciones",
      href: `/admin/clientes/${id}/conexiones`,
      icon: (
        <svg className="w-7 h-7 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      ),
      badge: igApp ? `@${igApp.app_username}` : "No conectado",
      badgeOk: !!igApp,
    },
    {
      title: "Onboarding",
      description: "Datos del formulario de onboarding del cliente",
      href: `/admin/clientes/${id}/onboarding`,
      icon: (
        <svg className="w-7 h-7 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
        </svg>
      ),
      badge: onboarding?.completed_at ? "Completado" : onboarding ? "En progreso" : "No iniciado",
      badgeOk: !!onboarding?.completed_at,
    },
    {
      title: "Métricas",
      description: "Estadísticas de Instagram sincronizadas",
      href: `/admin/clientes/${id}/metricas`,
      icon: (
        <svg className="w-7 h-7 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      badge: igProfile ? `${igProfile.followers_count?.toLocaleString("es")} seguidores` : "Sin datos",
      badgeOk: !!igProfile,
      disabled: true,
    },
  ];

  return (
    <div className="flex-1">
      <header className="bg-espresso px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-semibold">Admin — Aura Digital</h1>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="text-sm text-clay hover:text-terra transition-colors">
            Salir
          </button>
        </form>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Back + client info */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="text-clay hover:text-terra transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-terra/10 flex items-center justify-center text-terra font-bold">
              {(client.full_name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-espresso">{client.full_name}</h2>
              <p className="text-xs text-clay">
                {client.email} &middot; {client.slug}
              </p>
            </div>
          </div>
        </div>

        {/* Section cards */}
        <div className="space-y-3">
          {sections.map((section) => {
            const card = (
              <div
                className={`rounded-lg border bg-white p-5 transition-all ${
                  section.disabled
                    ? "border-sand/50 opacity-50"
                    : "border-sand hover:border-terra hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">{section.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-espresso">{section.title}</h3>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            section.badgeOk
                              ? "text-terra bg-terra/10"
                              : "text-clay bg-sand"
                          }`}
                        >
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-xs text-clay mt-0.5">{section.description}</p>
                    </div>
                  </div>
                  {!section.disabled && (
                    <svg className="w-4 h-4 text-clay shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </div>
              </div>
            );

            if (section.disabled) {
              return <div key={section.title} className="cursor-not-allowed">{card}</div>;
            }

            return (
              <Link key={section.title} href={section.href} className="block">
                {card}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
