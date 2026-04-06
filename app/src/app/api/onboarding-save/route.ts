import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  type OnboardingData,
  computeCompletedSections,
} from "@/app/mi-marca/onboarding/lib/schema";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, data } = body as { clientId: string; data: OnboardingData };

  if (!clientId || !data) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify client belongs to user
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
