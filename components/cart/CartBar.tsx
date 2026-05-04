"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Truck } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { formatPrice } from "@/lib/utils";
import { freeShippingProgress } from "@/lib/shipping";

export function CartBar() {
  const { cartCount, cartSubtotalCents, startCheckout } = useApp();
  const visible = cartCount > 0;
  const shipping = freeShippingProgress(cartSubtotalCents);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-6"
        >
          <div className="glass w-full max-w-md overflow-hidden rounded-3xl shadow-xl">
            {/* Shipping nudge — slim row */}
            <div className="border-b border-white/40 px-4 py-2">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-ink-700">
                  <Truck size={11} strokeWidth={2} />
                  {shipping.qualifies ? (
                    <span className="font-medium text-emerald-700">
                      Free shipping unlocked
                    </span>
                  ) : (
                    <span>
                      <span className="font-semibold tabular-nums text-ink-950">
                        {formatPrice(shipping.awayCents)}
                      </span>{" "}
                      to free shipping
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] text-ink-400 tabular-nums">
                  {Math.round(shipping.progress * 100)}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                    shipping.qualifies ? "bg-emerald-600" : "bg-ink-950"
                  }`}
                  style={{ width: `${shipping.progress * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={startCheckout}
              className="group flex w-full items-center gap-3 p-1.5 pl-4 text-sm transition hover:scale-[1.005]"
            >
              <ShoppingBag size={16} strokeWidth={2} className="text-ink-950" />
              <span className="text-ink-950">
                <span className="font-semibold tabular-nums">{cartCount}</span>{" "}
                {cartCount === 1 ? "item" : "items"}
              </span>
              <span className="ml-auto font-semibold tabular-nums text-ink-950">
                {formatPrice(cartSubtotalCents)}
              </span>
              <span className="ml-1 inline-flex h-9 items-center rounded-full bg-ink-950 px-4 text-sm font-medium text-white transition group-hover:bg-ink-800">
                Checkout
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
