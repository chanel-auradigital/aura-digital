import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import OnboardingForm from "./onboarding-form";
import {
  type OnboardingData,
  type CompletedSections,
  EMPTY_DATA,
  SECTION_ORDER,
  computeCompletedSections,
} from "./lib/schema";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email;

  // Get or create client record
  let { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) {
    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        slug: user.email?.split("@")[0] || user.id,
      })
      .select("id")
      .single();

    if (error || !newClient) {
      throw new Error("No se pudo crear el registro de cliente");
    }
    client = newClient;
  }

  // Load existing onboarding draft
  const { data: onboarding } = await supabase
    .from("client_onboarding")
    .select("data, completed_sections")
    .eq("client_id", client.id)
    .single();

  const initialData: OnboardingData = onboarding?.data
    ? { ...EMPTY_DATA, ...(onboarding.data as Partial<OnboardingData>) }
    : EMPTY_DATA;

  const initialCompletedSections: CompletedSections = onboarding?.completed_sections
    ? (onboarding.completed_sections as CompletedSections)
    : Object.fromEntries(SECTION_ORDER.map((k) => [k, false])) as CompletedSections;

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
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/mi-marca"
            className="text-clay hover:text-terra transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-espresso">Onboarding</h1>
            <p className="text-clay text-sm mt-0.5">
              Cuéntanos sobre tu negocio para diseñar tu estrategia.
            </p>
          </div>
        </div>

        <OnboardingForm
          clientId={client.id}
          initialData={initialData}
          initialCompletedSections={initialCompletedSections}
        />
      </main>
    </div>
  );
}
