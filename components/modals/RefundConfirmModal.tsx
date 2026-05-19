"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/components/AppProvider";

export function RefundConfirmModal() {
  const { modal, setModal } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (modal.kind !== "refund") {
    return <Modal open={false} onClose={() => setModal({ kind: "none" })} />;
  }
  const { reservationId, productName } = modal;

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Refund failed");
      setModal({ kind: "none" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => setModal({ kind: "none" })}
      title="Refund this order?"
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-700">
          We&rsquo;ll cancel your order for{" "}
          <span className="font-medium">{productName}</span> and refund your
          card via Stripe. This usually settles within a few business days.
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setModal({ kind: "none" })}
            className="sm:flex-1"
          >
            Keep
          </Button>
          <Button
            type="button"
            variant="danger"
            size="lg"
            onClick={confirm}
            disabled={busy}
            className="sm:flex-1"
          >
            {busy ? "Refunding…" : "Refund"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
