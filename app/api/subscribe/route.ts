import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  email: z.string().email().max(254),
  source: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof z.ZodError ? "Enter a valid email." : "Bad request" },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("subscribers")
    .insert({ email: body.email.toLowerCase(), source: body.source ?? "footer" });

  // Treat duplicate-email as success — the user thinks they're subscribed
  // either way, no need to expose membership info.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
