"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { INVITES_REQUIRED } from "@/lib/invites";
import type { ProductWithBatch } from "@/lib/types";

type Modal =
  | { kind: "none" }
  | { kind: "auth"; next?: () => void }
  | { kind: "info"; product: ProductWithBatch }
  | { kind: "join"; product: ProductWithBatch }
  | { kind: "invite"; next?: () => void }
  | { kind: "refund"; reservationId: string; productName: string };

type Ctx = {
  user: User | null;
  inviteCount: number;
  invitesRemaining: number;
  refreshInvites: () => Promise<void>;
  modal: Modal;
  setModal: (m: Modal) => void;
  signOut: () => Promise<void>;
  /** Click-to-join handler used by ProductCard. */
  joinClicked: (product: ProductWithBatch) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp used outside <AppProvider>");
  return ctx;
}

export function AppProvider({
  initialUser,
  initialInviteCount,
  children,
}: {
  initialUser: User | null;
  initialInviteCount: number;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(initialUser);
  const [inviteCount, setInviteCount] = useState(initialInviteCount);
  const [modal, setModal] = useState<Modal>({ kind: "none" });

  const refreshInvites = useCallback(async () => {
    if (!user) {
      setInviteCount(0);
      return;
    }
    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("inviter_id", user.id);
    setInviteCount(count ?? 0);
  }, [user, supabase]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // When user changes, sync invite count
  useEffect(() => {
    refreshInvites();
  }, [refreshInvites]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInviteCount(0);
  }, [supabase]);

  const joinClicked = useCallback(
    (product: ProductWithBatch) => {
      if (!user) {
        setModal({
          kind: "auth",
          next: () => setModal({ kind: "join", product }),
        });
      } else {
        setModal({ kind: "join", product });
      }
    },
    [user],
  );

  const value: Ctx = {
    user,
    inviteCount,
    invitesRemaining: Math.max(0, INVITES_REQUIRED - inviteCount),
    refreshInvites,
    modal,
    setModal,
    signOut,
    joinClicked,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
