import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserReservations, getInviteCount } from "@/lib/queries";
import { AppProvider } from "@/components/AppProvider";
import { StickyNav } from "@/components/nav/StickyNav";
import { ModalManager } from "@/components/ModalManager";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [reservations, inviteCount] = await Promise.all([
    getCurrentUserReservations(),
    getInviteCount(),
  ]);

  return (
    <AppProvider initialUser={user} initialInviteCount={inviteCount}>
      <StickyNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
              Account
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
              Your orders
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Signed in as{" "}
              <span className="font-mono">
                {user.phone
                  ? user.phone.startsWith("+")
                    ? user.phone
                    : `+${user.phone}`
                  : ""}
              </span>{" "}
              · {inviteCount} invite{inviteCount === 1 ? "" : "s"} sent
            </p>
          </div>
        </div>

        <DashboardView reservations={reservations} />
      </main>
      <ModalManager />
    </AppProvider>
  );
}
