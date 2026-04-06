import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Get all clients with their connection status
  const { data: clients } = await supabase
    .from("clients")
    .select("id, slug, full_name, email, created_at")
    .order("created_at", { ascending: false });

  // Get all connections
  const { data: apps } = await supabase
    .from("client_apps")
    .select("client_id, app_name, app_username, connected_at");

  // Get onboarding status
  const { data: onboardings } = await supabase
    .from("client_onboarding")
    .select("client_id, completed_at");

  const appsByClient = new Map<string, typeof apps>();
  for (const app of apps || []) {
    const list = appsByClient.get(app.client_id) || [];
    list.push(app);
    appsByClient.set(app.client_id, list);
  }

  const onboardingByClient = new Map<string, boolean>();
  for (const ob of onboardings || []) {
    onboardingByClient.set(ob.client_id, !!ob.completed_at);
  }

  return (
    <div className="flex-1">
      <header className="bg-espresso px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-semibold">Admin — Aura Digital</h1>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="text-sm text-clay hover:text-terra transition-colors"
          >
            Salir
          </button>
        </form>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-espresso">Clientes</h2>
            <p className="text-clay text-sm mt-0.5">
              {(clients || []).length} cliente{(clients || []).length !== 1 ? "s" : ""} registrado{(clients || []).length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {(!clients || clients.length === 0) ? (
          <div className="rounded-lg border-2 border-dashed border-sand p-8 text-center">
            <p className="text-clay">No hay clientes registrados aún.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => {
              const clientApps = appsByClient.get(client.id) || [];
              const igApp = clientApps.find((a) => a.app_name === "instagram");
              const onboardingDone = onboardingByClient.get(client.id) || false;

              return (
                <Link
                  key={client.id}
                  href={`/admin/clientes/${client.id}`}
                  className="block rounded-lg border border-sand bg-white p-5 hover:border-terra hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center text-terra font-semibold text-sm">
                        {(client.full_name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-espresso">
                          {client.full_name || client.slug}
                        </h3>
                        <p className="text-xs text-clay">{client.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Onboarding badge */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          onboardingDone
                            ? "text-terra bg-terra/10"
                            : "text-clay bg-sand"
                        }`}
                      >
                        {onboardingDone ? "Onboarding" : "Sin onboarding"}
                      </span>

                      {/* Instagram badge */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          igApp
                            ? "text-terra bg-terra/10"
                            : "text-clay bg-sand"
                        }`}
                      >
                        {igApp ? `@${igApp.app_username}` : "IG no conectado"}
                      </span>

                      <svg className="w-4 h-4 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
