"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, Truck, X } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { currentPriceCents } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { freeShippingProgress } from "@/lib/shipping";

export function SideCart() {
  const {
    sideCartOpen,
    closeSideCart,
    cartItems,
    cartCount,
    cartSubtotalCents,
    setCartQuantity,
    incrementCart,
    decrementCart,
    startCheckout,
  } = useApp();

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!sideCartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sideCartOpen]);

  // Close on ESC.
  useEffect(() => {
    if (!sideCartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSideCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sideCartOpen, closeSideCart]);

  const shipping = freeShippingProgress(cartSubtotalCents);
  const empty = cartItems.length === 0;

  return (
    <AnimatePresence>
      {sideCartOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm"
            onClick={closeSideCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:max-w-md"
            role="dialog"
            aria-label="Shopping bag"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight text-ink-950">
                Shopping bag
                {cartCount > 0 && (
                  <span className="ml-2 text-ink-400 tabular-nums">
                    ({cartCount})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={closeSideCart}
                aria-label="Close bag"
                className="-mr-2 grid h-9 w-9 place-items-center rounded-full text-ink-500 transition hover:bg-black/5 hover:text-ink-950"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free shipping banner */}
            {!empty && (
              <div className="border-b border-black/5 px-5 py-3">
                {shipping.qualifies ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <Truck size={14} strokeWidth={2} />
                    <span className="font-medium">
                      You&rsquo;ve unlocked free shipping
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-ink-600">
                      <span className="flex items-center gap-1.5">
                        <Truck size={12} strokeWidth={2} />
                        <span>
                          <span className="font-semibold tabular-nums text-ink-950">
                            {formatPrice(shipping.awayCents)}
                          </span>{" "}
                          to free shipping
                        </span>
                      </span>
                      <span className="font-mono text-[10px] text-ink-400 tabular-nums">
                        {Math.round(shipping.progress * 100)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-ink-950 transition-[width] duration-500 ease-out"
                        style={{ width: `${shipping.progress * 100}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Body — scrollable items list */}
            <div className="flex-1 overflow-y-auto">
              {empty ? (
                <div className="grid h-full place-items-center px-6 text-center">
                  <div>
                    <p className="text-sm text-ink-500">
                      Your bag is empty.
                    </p>
                    <button
                      type="button"
                      onClick={closeSideCart}
                      className="mt-4 inline-flex h-10 items-center rounded-full bg-ink-950 px-5 text-sm font-medium text-white transition hover:bg-ink-800"
                    >
                      Browse drops
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-black/5">
                  {cartItems.map((item) => {
                    const price = currentPriceCents(
                      item.product.batch.units_reserved,
                      item.product.moq,
                      item.product.price_curve,
                    );
                    const lineTotal = price * item.quantity;
                    const lineKey = `${item.product.id}::${item.variant?.id ?? "default"}`;
                    return (
                      <li
                        key={lineKey}
                        className="flex items-start gap-3 px-5 py-4"
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100"
                          style={{
                            backgroundImage: `url(${item.product.image_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                          aria-hidden
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-sm font-medium text-ink-950">
                                {item.variant?.swatch_hex && (
                                  <span
                                    className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-black/15"
                                    style={{
                                      background: item.variant.swatch_hex,
                                    }}
                                    aria-hidden
                                  />
                                )}
                                <span className="truncate">
                                  {item.product.name}
                                </span>
                              </div>
                              {item.variant && (
                                <div className="text-xs text-ink-500">
                                  {item.variant.name}
                                </div>
                              )}
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-950">
                              {formatPrice(lineTotal)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                aria-label="Decrease"
                                onClick={() =>
                                  decrementCart(item.product, item.variant)
                                }
                                className="grid h-7 w-7 place-items-center rounded-full bg-white hairline text-ink-700 transition hover:bg-ink-50"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center font-mono text-sm tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase"
                                onClick={() =>
                                  incrementCart(item.product, item.variant)
                                }
                                className="grid h-7 w-7 place-items-center rounded-full bg-white hairline text-ink-700 transition hover:bg-ink-50"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setCartQuantity(item.product, item.variant, 0)
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-ink-500 transition hover:text-red-600"
                            >
                              <Trash2 size={11} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer — totals + actions */}
            {!empty && (
              <div className="border-t border-black/5 px-5 pt-4 pb-[max(env(safe-area-inset-bottom),16px)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Subtotal</span>
                  <span className="font-semibold tabular-nums text-ink-950">
                    {formatPrice(cartSubtotalCents)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-ink-500">
                  <span>Shipping</span>
                  <span>
                    {shipping.qualifies ? "Free" : "Calculated at checkout"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={startCheckout}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-ink-950 text-sm font-medium text-white transition hover:bg-ink-800"
                >
                  Checkout · {formatPrice(cartSubtotalCents)}
                </button>
                <button
                  type="button"
                  onClick={closeSideCart}
                  className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-medium text-ink-700 hairline transition hover:bg-ink-50"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
