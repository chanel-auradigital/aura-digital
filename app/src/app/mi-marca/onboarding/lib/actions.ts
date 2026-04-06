"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  type OnboardingData,
  computeCompletedSections,
  isAllComplete,
} from "./schema";

export async function saveOnboardingDraft(
  clientId: string,
  data: OnboardingData
) {
  const supabase = await createClient();
  const completedSections = computeCompletedSections(data);

  const { error } = await supabase.from("client_onboarding").upsert(
    {
      client_id: clientId,
      data,
      completed_sections: completedSections,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id" }
  );

  if (error) {
    console.error("Save onboarding error:", error);
    return { ok: false, completedSections };
  }

  return { ok: true, completedSections };
}

export async function completeOnboarding(clientId: string) {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("client_onboarding")
    .select("data")
    .eq("client_id", clientId)
    .single();

  if (!row) {
    return { ok: false, error: "No onboarding data found" };
  }

  const sections = computeCompletedSections(row.data as OnboardingData);
  if (!isAllComplete(sections)) {
    return { ok: false, error: "Incomplete sections" };
  }

  const { error } = await supabase
    .from("client_onboarding")
    .update({
      completed_at: new Date().toISOString(),
      completed_sections: sections,
    })
    .eq("client_id", clientId);

  if (error) {
    return { ok: false, error: error.message };
  }

  redirect("/mi-marca");
}
