import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email;

  // Get client record
  const { data: client } = await supabase
    .from("clients")
    .select("id, slug, full_name")
    .eq("user_id", user.id)
    .single();

  // Get Instagram profile for summary
  const { data: igProfile } = client
    ? await supabase
        .from("instagram_profiles")
        .select("username, profile_picture_url, followers_count")
        .eq("client_id", client.id)
        .single()
    : { data: null };

  const sections = [
    {
      title: "M\u00e9tricas",
      description: "Estad\u00edsticas de Instagram: seguidores, alcance, engagement y publicaciones",
      href: "/dashboard",
      icon: (
        <svg className="w-8 h-8 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
    },
    {
      title: "Mi Marca",
      description: "Construye tu marca paso a paso: onboarding, briefing e identidad visual",
      href: "/mi-marca",
      icon: (
        <svg className="w-8 h-8 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
      ),
    },
    {
      title: "Conexiones",
      description: "Conecta tus redes sociales para sincronizar métricas automáticamente",
      href: "/conexiones",
      icon: (
        <svg className="w-8 h-8 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      ),
    },
    {
      title: "Reportes",
      description: "Reportes semanales y mensuales de rendimiento",
      href: "#",
      icon: (
        <svg className="w-8 h-8 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      disabled: true,
    },
    {
      title: "Contenido",
      description: "Calendario de publicaciones y contenido aprobado",
      href: "#",
      icon: (
        <svg className="w-8 h-8 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
      disabled: true,
    },
    {
      title: "Estrategia",
      description: "Plan de marketing, posicionamiento y objetivos",
      href: "#",
      icon: (
        <svg className="w-8 h-8 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      ),
      disabled: true,
    },
  ];

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-espresso px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.svg" alt="Aura Digital" width={140} height={56} />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sand text-sm">{name}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-clay hover:text-terra transition-colors"
            >
              Cerrar sesi&oacute;n
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="flex items-center gap-4 mb-10">
          {igProfile?.profile_picture_url && (
            <img
              src={igProfile.profile_picture_url}
              alt={igProfile.username || ""}
              className="w-14 h-14 rounded-full border-2 border-sand"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold text-espresso">
              Hola, {client?.full_name || name}
            </h1>
            {igProfile && (
              <p className="text-clay text-sm">
                @{igProfile.username} &middot; {(igProfile.followers_count || 0).toLocaleString("es")} seguidores
              </p>
            )}
          </div>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className={`group rounded-lg border bg-white p-6 transition-all ${
                section.disabled
                  ? "border-sand/50 opacity-50 pointer-events-none"
                  : "border-sand hover:border-terra hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">{section.icon}</div>
                <div>
                  <h2 className="text-lg font-semibold text-espresso group-hover:text-terra transition-colors">
                    {section.title}
                    {section.disabled && (
                      <span className="ml-2 text-xs font-normal text-clay bg-sand px-2 py-0.5 rounded">
                        Pr&oacute;ximamente
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-clay mt-1">{section.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
