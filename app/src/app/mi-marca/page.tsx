import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import StepCards from "./step-cards";

export default async function MiMarcaPage() {
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

  // Check step completion from DB (tables may not exist yet)
  let onboardingDone = false;
  let briefingDone = false;

  if (client) {
    const { data: onboarding, error: onbErr } = await supabase
      .from("client_onboarding")
      .select("id, completed_at")
      .eq("client_id", client.id)
      .single();
    onboardingDone = !onbErr && !!onboarding?.completed_at;

    if (onboardingDone) {
      const { data: briefing, error: brfErr } = await supabase
        .from("client_briefing")
        .select("id")
        .eq("client_id", client.id)
        .single();
      briefingDone = !brfErr && !!briefing;
    }
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
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="text-clay hover:text-terra transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold text-espresso">Mi Marca</h1>
        </div>
        <p className="text-clay text-sm mb-10 ml-8">
          Completa cada paso en orden para construir tu marca.
        </p>

        <StepCards onboardingDone={onboardingDone} briefingDone={briefingDone} />
      </main>
    </div>
  );
}
