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
import { currentPriceCents } from "@/lib/pricing";
import type { ProductVariant, ProductWithBatch } from "@/lib/types";

type Modal =
  | { kind: "none" }
  | { kind: "auth"; next?: () => void }
  | { kind: "info"; product: ProductWithBatch }
  | { kind: "checkout" }
  | { kind: "invite"; next?: () => void }
  | { kind: "refund"; reservationId: string; productName: string };

type CartItem = {
  product: ProductWithBatch;
  /** Selected variant, if the product has any. Null for variant-less products. */
  variant: ProductVariant | null;
  quantity: number;
};

/** Cart map key = `${productId}::${variantId ?? "default"}`. */
function cartKey(productId: string, variantId: string | null): string {
  return `${productId}::${variantId ?? "default"}`;
}

type Ctx = {
  user: User | null;
  inviteCount: number;
  invitesRemaining: number;
  refreshInvites: () => Promise<void>;
  modal: Modal;
  setModal: (m: Modal) => void;
  signOut: () => Promise<void>;
  // Cart
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotalCents: number;
  /** Returns the qty of (product × variant) currently in cart. */
  getCartQuantity: (
    product: ProductWithBatch,
    variant: ProductVariant | null,
  ) => number;
  setCartQuantity: (
    product: ProductWithBatch,
    variant: ProductVariant | null,
    quantity: number,
  ) => void;
  incrementCart: (
    product: ProductWithBatch,
    variant: ProductVariant | null,
  ) => void;
  decrementCart: (
    product: ProductWithBatch,
    variant: ProductVariant | null,
  ) => void;
  clearCart: () => void;
  /** Slide-in side cart drawer state. */
  sideCartOpen: boolean;
  openSideCart: () => void;
  closeSideCart: () => void;
  /** Open checkout, prompting auth first if needed. */
  startCheckout: () => void;
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
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [sideCartOpen, setSideCartOpen] = useState(false);

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

  useEffect(() => {
    refreshInvites();
  }, [refreshInvites]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInviteCount(0);
  }, [supabase]);

  const setCartQuantity = useCallback(
    (
      product: ProductWithBatch,
      variant: ProductVariant | null,
      quantity: number,
    ) => {
      const key = cartKey(product.id, variant?.id ?? null);
      setCart((prev) => {
        const next = new Map(prev);
        const max = Math.max(0, product.moq - product.batch.units_reserved);
        const clamped = Math.max(0, Math.min(10, Math.min(max, quantity)));
        if (clamped <= 0) next.delete(key);
        else next.set(key, { product, variant, quantity: clamped });
        return next;
      });
    },
    [],
  );

  const incrementCart = useCallback(
    (product: ProductWithBatch, variant: ProductVariant | null) => {
      const key = cartKey(product.id, variant?.id ?? null);
      let didAdd = false;
      setCart((prev) => {
        const cur = prev.get(key)?.quantity ?? 0;
        const next = new Map(prev);
        const max = Math.max(0, product.moq - product.batch.units_reserved);
        const clamped = Math.max(0, Math.min(10, Math.min(max, cur + 1)));
        if (clamped <= 0) next.delete(key);
        else next.set(key, { product, variant, quantity: clamped });
        didAdd = clamped > cur;
        return next;
      });
      // Surface the side cart whenever the user actually grew the cart.
      if (didAdd) setSideCartOpen(true);
    },
    [],
  );

  const decrementCart = useCallback(
    (product: ProductWithBatch, variant: ProductVariant | null) => {
      const key = cartKey(product.id, variant?.id ?? null);
      setCart((prev) => {
        const cur = prev.get(key)?.quantity ?? 0;
        const next = new Map(prev);
        const target = cur - 1;
        if (target <= 0) next.delete(key);
        else next.set(key, { product, variant, quantity: target });
        return next;
      });
    },
    [],
  );

  const clearCart = useCallback(() => setCart(new Map()), []);

  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);
  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems],
  );
  const cartSubtotalCents = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = currentPriceCents(
          item.product.batch.units_reserved,
          item.product.moq,
          item.product.price_curve,
        );
        return sum + price * item.quantity;
      }, 0),
    [cartItems],
  );

  const getCartQuantity = useCallback(
    (product: ProductWithBatch, variant: ProductVariant | null) => {
      return cart.get(cartKey(product.id, variant?.id ?? null))?.quantity ?? 0;
    },
    [cart],
  );

  const openSideCart = useCallback(() => setSideCartOpen(true), []);
  const closeSideCart = useCallback(() => setSideCartOpen(false), []);

  const startCheckout = useCallback(() => {
    setSideCartOpen(false);
    if (!user) {
      setModal({
        kind: "auth",
        next: () => setModal({ kind: "checkout" }),
      });
    } else {
      setModal({ kind: "checkout" });
    }
  }, [user]);

  const value: Ctx = {
    user,
    inviteCount,
    invitesRemaining: Math.max(0, INVITES_REQUIRED - inviteCount),
    refreshInvites,
    modal,
    setModal,
    signOut,
    cartItems,
    cartCount,
    cartSubtotalCents,
    getCartQuantity,
    setCartQuantity,
    incrementCart,
    decrementCart,
    clearCart,
    sideCartOpen,
    openSideCart,
    closeSideCart,
    startCheckout,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
