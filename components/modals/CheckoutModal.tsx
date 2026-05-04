"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/components/AppProvider";
import { currentPriceCents } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { INVITES_REQUIRED } from "@/lib/invites";
import { getStripe } from "@/lib/stripe/client";
import {
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";

const stripePromise = typeof window !== "undefined" ? getStripe() : null;

export function CheckoutModal() {
  const {
    modal,
    setModal,
    cartItems,
    cartSubtotalCents,
    cartCount,
    incrementCart,
    decrementCart,
    setCartQuantity,
    clearCart,
    invitesRemaining,
    inviteCount,
  } = useApp();

  const open = modal.kind === "checkout";

  const [payDouble, setPayDouble] = useState(false);
  const [phase, setPhase] = useState<"configure" | "pay" | "success">(
    "configure",
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When the user has already invited 2 people, the pay-double option is moot.
  const locked = invitesRemaining > 0;
  const skipMultiplier = locked && payDouble ? 2 : 1;
  const totalCents = cartSubtotalCents * skipMultiplier;
  const canPay = !locked || payDouble;

  function close() {
    setPayDouble(false);
    setPhase("configure");
    setClientSecret(null);
    setError(null);
    setModal({ kind: "none" });
  }

  async function startCheckout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            batch_id: i.product.batch.id,
            quantity: i.quantity,
          })),
          pay_double: payDouble,
        }),
      });
      const data = (await res.json()) as {
        client_secret?: string;
        error?: string;
      };
      if (!res.ok || !data.client_secret) {
        throw new Error(data.error || "Could not start payment");
      }
      setClientSecret(data.client_secret);
      setPhase("pay");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (phase === "success") {
    return (
      <Modal open={open} onClose={close} title="">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <CheckCircle2 className="h-10 w-10 text-ink-950" strokeWidth={1.5} />
          <div>
            <h3 className="text-base font-semibold tracking-tight text-ink-950">
              You&rsquo;re in.
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              {cartCount} {cartCount === 1 ? "unit" : "units"} reserved across{" "}
              {cartItems.length} drop{cartItems.length === 1 ? "" : "s"} —{" "}
              {formatPrice(totalCents)} charged.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="mt-2"
            onClick={() => {
              clearCart();
              close();
            }}
          >
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  if (phase === "pay" && clientSecret) {
    return (
      <Modal open={open} onClose={close} title="Pay">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "flat",
              variables: {
                colorPrimary: "#09090b",
                colorText: "#09090b",
                colorBackground: "#ffffff",
                borderRadius: "12px",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                fontSizeBase: "15px",
              },
            },
          }}
        >
          <PaymentForm
            totalCents={totalCents}
            onSuccess={() => setPhase("success")}
            onBack={() => {
              setPhase("configure");
              setClientSecret(null);
            }}
          />
        </Elements>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} title="Your cart" size="lg">
      {cartItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-500">
          Your cart is empty. Add items from the drops below.
        </p>
      ) : (
        <div className="space-y-5">
          <ul className="divide-y divide-black/5 rounded-2xl bg-ink-50 px-4">
            {cartItems.map((item) => {
              const price = currentPriceCents(
                item.product.batch.units_reserved,
                item.product.moq,
                item.product.price_curve,
              );
              return (
                <li
                  key={item.product.id}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink-950">
                      {item.product.name}
                    </div>
                    <div className="text-xs text-ink-500">
                      {formatPrice(price)} each
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => decrementCart(item.product)}
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
                      onClick={() => incrementCart(item.product)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white hairline text-ink-700 transition hover:bg-ink-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setCartQuantity(item.product, 0)}
                    className="ml-1 grid h-7 w-7 place-items-center rounded-full text-ink-400 transition hover:bg-black/5 hover:text-ink-700"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="w-20 text-right text-sm font-medium tabular-nums text-ink-950">
                    {formatPrice(price * item.quantity)}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Invite-or-pay-double gate */}
          {locked && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
                One last step
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPayDouble(false);
                    setModal({
                      kind: "invite",
                      next: () => setModal({ kind: "checkout" }),
                    });
                  }}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                    !payDouble
                      ? "border-ink-950 bg-ink-50"
                      : "border-ink-200 bg-white hover:border-ink-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-ink-700" />
                    <span className="text-sm font-semibold text-ink-950">
                      Invite 2 friends
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-ink-500">
                    Drop in two phone numbers we don&rsquo;t already have.
                    Standard price.
                  </p>
                  <span className="mt-1 font-mono text-[10px] text-ink-400">
                    {Math.min(inviteCount, INVITES_REQUIRED)} /{" "}
                    {INVITES_REQUIRED} invited
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayDouble(true)}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                    payDouble
                      ? "border-ink-950 bg-ink-50"
                      : "border-ink-200 bg-white hover:border-ink-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-ink-700" />
                    <span className="text-sm font-semibold text-ink-950">
                      Skip — pay double
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-ink-500">
                    No invites needed. You pay 2× total.
                  </p>
                  <span className="mt-1 font-mono text-[10px] text-ink-400">
                    {formatPrice(cartSubtotalCents * 2)}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="rounded-2xl bg-ink-50 p-4 text-sm">
            <div className="flex items-center justify-between text-ink-500">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatPrice(cartSubtotalCents)}
              </span>
            </div>
            {locked && payDouble && (
              <div className="mt-1 flex items-center justify-between text-ink-500">
                <span>Skip-invites multiplier</span>
                <span className="tabular-nums">×2</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2 text-base font-semibold text-ink-950">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(totalCents)}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <Button
            size="lg"
            className="w-full"
            onClick={startCheckout}
            disabled={!canPay || busy || cartItems.length === 0}
          >
            {!canPay
              ? "Choose invite or pay double to continue"
              : busy
                ? "Preparing…"
                : `Pay & reserve · ${formatPrice(totalCents)}`}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function PaymentForm({
  totalCents,
  onSuccess,
  onBack,
}: {
  totalCents: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: "if_required",
    });
    setBusy(false);
    if (error) {
      setError(error.message ?? "Payment failed");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          className="sm:flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          className="sm:flex-[2]"
          disabled={!stripe || busy}
        >
          {busy ? "Charging…" : `Pay ${formatPrice(totalCents)}`}
        </Button>
      </div>
    </form>
  );
}
