import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

const platforms = [
  {
    key: "instagram",
    name: "Instagram",
    description: "Conecta tu cuenta para sincronizar métricas, posts y comentarios automáticamente.",
    href: "/conexiones/instagram",
    color: "from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
      </svg>
    ),
    active: true,
  },
  {
    key: "tiktok",
    name: "TikTok",
    description: "Sincroniza métricas de TikTok y analiza el rendimiento de tus vídeos.",
    href: "#",
    color: "bg-black",
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15Z" />
      </svg>
    ),
    active: false,
  },
  {
    key: "facebook",
    name: "Facebook",
    description: "Conecta tu página de Facebook para métricas y publicación cruzada.",
    href: "#",
    color: "bg-[#1877F2]",
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
      </svg>
    ),
    active: false,
  },
];

export default async function ConexionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email;

  // Get client + connected apps
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let connectedApps: string[] = [];
  if (client) {
    const { data: apps } = await supabase
      .from("client_apps")
      .select("app_name")
      .eq("client_id", client.id);
    connectedApps = (apps || []).map((a) => a.app_name);
  }

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
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="text-clay hover:text-terra transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold text-espresso">Conexiones</h1>
        </div>
        <p className="text-clay text-sm mb-10 ml-8">
          Conecta tus redes sociales para sincronizar métricas automáticamente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((platform) => {
            const connected = connectedApps.includes(platform.key);

            const card = (
              <div
                key={platform.key}
                className={`relative rounded-lg border bg-white overflow-hidden transition-all ${
                  platform.active
                    ? "border-sand hover:border-terra hover:shadow-md"
                    : "border-sand/50 opacity-50"
                }`}
              >
                {/* Icon bar */}
                <div
                  className={`h-16 flex items-center justify-center ${
                    platform.key === "instagram"
                      ? `bg-gradient-to-r ${platform.color}`
                      : platform.color
                  }`}
                >
                  {platform.icon}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-espresso">{platform.name}</h2>
                    {connected && (
                      <span className="text-[10px] font-medium text-terra bg-terra/10 px-1.5 py-0.5 rounded">
                        Conectado
                      </span>
                    )}
                    {!platform.active && (
                      <span className="text-[10px] font-medium text-clay bg-sand px-1.5 py-0.5 rounded">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-clay leading-relaxed">
                    {platform.description}
                  </p>
                </div>
              </div>
            );

            if (platform.active) {
              return (
                <Link key={platform.key} href={platform.href} className="block">
                  {card}
                </Link>
              );
            }

            return <div key={platform.key} className="cursor-not-allowed">{card}</div>;
          })}
        </div>
      </main>
    </div>
  );
}
