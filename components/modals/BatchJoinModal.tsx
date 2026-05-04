"use client";

import { useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { useApp } from "@/components/AppProvider";
import { useBatchRealtime } from "@/lib/realtime";
import { currentPriceCents } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { INVITES_REQUIRED } from "@/lib/invites";
import { getStripe } from "@/lib/stripe/client";
import { Minus, Plus, Lock, CheckCircle2 } from "lucide-react";

const stripePromise = typeof window !== "undefined" ? getStripe() : null;

export function BatchJoinModal() {
  const { modal, setModal, user, inviteCount, invitesRemaining } = useApp();
  if (modal.kind !== "join") {
    return <Modal open={false} onClose={() => setModal({ kind: "none" })} />;
  }
  const product = modal.product;

  return (
    <Modal
      open
      onClose={() => setModal({ kind: "none" })}
      title="Join batch"
      size="md"
    >
      <JoinBody
        productId={product.id}
        productName={product.name}
        moq={product.moq}
        priceCurve={product.price_curve}
        initialBatch={product.batch}
        userId={user?.id ?? null}
        inviteCount={inviteCount}
        invitesRemaining={invitesRemaining}
        onLockedClick={() =>
          setModal({
            kind: "invite",
            next: () => setModal({ kind: "join", product }),
          })
        }
        onDone={() => setModal({ kind: "none" })}
      />
    </Modal>
  );
}

function JoinBody({
  productId,
  productName,
  moq,
  priceCurve,
  initialBatch,
  userId,
  inviteCount,
  invitesRemaining,
  onLockedClick,
  onDone,
}: {
  productId: string;
  productName: string;
  moq: number;
  priceCurve: { threshold: number; price_cents: number }[];
  initialBatch: import("@/lib/types").Batch;
  userId: string | null;
  inviteCount: number;
  invitesRemaining: number;
  onLockedClick: () => void;
  onDone: () => void;
}) {
  void productId;
  const batch = useBatchRealtime(initialBatch);

  const [quantity, setQuantity] = useState(1);
  const [phase, setPhase] = useState<"configure" | "pay" | "success">(
    "configure",
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [lockedPrice, setLockedPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const unitPrice = useMemo(
    () => currentPriceCents(batch.units_reserved, moq, priceCurve),
    [batch.units_reserved, moq, priceCurve],
  );
  const total = unitPrice * quantity;
  const remaining = Math.max(0, moq - batch.units_reserved);
  const maxQty = Math.max(1, Math.min(10, remaining));
  const filled = Math.max(0, Math.min(1, batch.units_reserved / moq));
  const locked = invitesRemaining > 0;
  const closed = batch.status !== "active" || new Date(batch.end_at) < new Date();

  async function startCheckout() {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: batch.id, quantity }),
      });
      const data = (await res.json()) as {
        client_secret?: string;
        error?: string;
      };
      if (!res.ok || !data.client_secret) {
        throw new Error(data.error || "Could not start payment");
      }
      setClientSecret(data.client_secret);
      setLockedPrice(unitPrice);
      setPhase("pay");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (phase === "success") {
    const paid = lockedPrice ?? unitPrice;
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <CheckCircle2 className="h-10 w-10 text-ink-950" strokeWidth={1.5} />
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink-950">
            You&rsquo;re in.
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            {quantity} × {productName} reserved at {formatPrice(paid)}.
          </p>
        </div>
        <Button onClick={onDone} variant="secondary" size="md" className="mt-2">
          Done
        </Button>
      </div>
    );
  }

  if (phase === "pay" && clientSecret) {
    return (
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
          totalCents={total}
          onSuccess={() => setPhase("success")}
          onBack={() => {
            setPhase("configure");
            setClientSecret(null);
          }}
        />
      </Elements>
    );
  }

  return (
    <div className="space-y-5">
      {/* Live progress */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-ink-700">
            {batch.units_reserved} / {moq} units
          </span>
          <span className="text-ink-500">{Math.round(filled * 100)}% full</span>
        </div>
        <ProgressBar value={filled} />
      </div>

      {/* Quantity stepper + price */}
      <div className="rounded-2xl bg-ink-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
              Current price
            </div>
            <div className="mt-0.5 text-2xl font-semibold tracking-tight text-ink-950">
              {formatPrice(unitPrice)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="grid h-9 w-9 place-items-center rounded-full bg-white hairline text-ink-700 transition disabled:opacity-40"
              aria-label="Decrease"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-mono text-base tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="grid h-9 w-9 place-items-center rounded-full bg-white hairline text-ink-700 transition disabled:opacity-40"
              aria-label="Increase"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/5 pt-3 text-sm">
          <span className="text-ink-500">Total</span>
          <span className="font-semibold tabular-nums text-ink-950">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Invite gate */}
      <div
        className={`rounded-2xl border p-4 ${
          locked ? "border-ink-200 bg-white" : "border-emerald-200 bg-emerald-50/50"
        }`}
      >
        <div className="flex items-center gap-2">
          {locked ? (
            <Lock className="h-4 w-4 text-ink-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          )}
          <span className="text-sm font-medium text-ink-950">
            {locked ? "Invite 2 friends to unlock" : "Unlocked"}
          </span>
          <span className="ml-auto font-mono text-xs text-ink-500 tabular-nums">
            {Math.min(inviteCount, INVITES_REQUIRED)} / {INVITES_REQUIRED}
          </span>
        </div>
        {locked && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            onClick={onLockedClick}
          >
            Invite to unlock
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button
        size="lg"
        className="w-full"
        onClick={startCheckout}
        disabled={locked || closed || busy || remaining === 0}
      >
        {closed
          ? "Batch closed"
          : remaining === 0
            ? "Sold out"
            : busy
              ? "Preparing…"
              : `Pay & reserve · ${formatPrice(total)}`}
      </Button>
    </div>
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
