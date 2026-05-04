import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { INVITES_REQUIRED, isValidE164 } from "@/lib/invites";

const Body = z.object({
  phone: z.string().refine(isValidE164, "Phone must be in E.164 format"),
});

export async function POST(req: Request) {
  let body;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof z.ZodError ? e.issues[0]?.message : "Bad request" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Block self-invite. Supabase stores user.phone as digits-only.
  if (user.phone) {
    const ownE164 = user.phone.startsWith("+") ? user.phone : `+${user.phone}`;
    if (ownE164 === body.phone) {
      return NextResponse.json(
        { error: "You can't invite yourself." },
        { status: 400 },
      );
    }
  }

  const admin = createSupabaseAdminClient();

  // Reject if invited phone already belongs to a profile
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", body.phone)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "That phone is already a Boringgg user." },
      { status: 409 },
    );
  }

  const { error: insertError } = await admin.from("referrals").insert({
    inviter_id: user.id,
    invited_phone: body.phone,
  });
  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You've already invited that number." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { count } = await admin
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("inviter_id", user.id);

  return NextResponse.json({
    count: count ?? 0,
    required: INVITES_REQUIRED,
  });
}
