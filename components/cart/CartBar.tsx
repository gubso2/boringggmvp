"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { formatPrice } from "@/lib/utils";

export function CartBar() {
  const { cartCount, cartSubtotalCents, startCheckout } = useApp();
  const visible = cartCount > 0;

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
          <button
            type="button"
            onClick={startCheckout}
            className="glass group flex w-full max-w-md items-center gap-3 rounded-full p-1.5 pl-4 text-sm shadow-xl transition hover:scale-[1.01]"
          >
            <ShoppingBag
              size={16}
              strokeWidth={2}
              className="text-ink-950"
            />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
