"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { useApp } from "@/components/AppProvider";
import { INVITES_REQUIRED, normalizePhone } from "@/lib/invites";

export function InviteModal() {
  const { modal, setModal, inviteCount, refreshInvites } = useApp();
  const open = modal.kind === "invite";
  const next = modal.kind === "invite" ? modal.next : undefined;

  const [phones, setPhones] = useState<string[]>(["", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setPhones(["", ""]);
    setError(null);
    setModal({ kind: "none" });
  }

  function update(i: number, v: string) {
    setPhones((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const stillNeeded = Math.max(0, INVITES_REQUIRED - inviteCount);
    const provided = phones
      .slice(0, stillNeeded)
      .map((p) => normalizePhone(p));

    if (provided.some((p) => p === null)) {
      setError("Each phone must be in international format (e.g. +14155550123).");
      return;
    }
    if (new Set(provided).size !== provided.length) {
      setError("The two phone numbers must be different.");
      return;
    }

    setBusy(true);
    try {
      for (const phone of provided as string[]) {
        const res = await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error || "Could not send invite");
      }
      await refreshInvites();
      const cb = next;
      close();
      cb?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const stillNeeded = Math.max(0, INVITES_REQUIRED - inviteCount);

  return (
    <Modal open={open} onClose={close} title="Invite to unlock">
      <div className="space-y-4">
        <p className="text-sm text-ink-500">
          Manufacturer-direct pricing only unlocks when you bring new people.
          Add{" "}
          <span className="font-medium text-ink-950">{stillNeeded}</span> phone
          {stillNeeded === 1 ? "" : "s"} of friends who don&rsquo;t have a
          Boringgg account yet.
        </p>

        <form onSubmit={submit} className="space-y-3">
          {Array.from({ length: stillNeeded }).map((_, i) => (
            <div key={i}>
              <label
                htmlFor={`invite-${i}`}
                className="mb-1.5 block text-xs font-medium text-ink-700"
              >
                Friend {i + 1}
              </label>
              <Input
                id={`invite-${i}`}
                type="tel"
                autoComplete="off"
                placeholder="+1 415 555 0123"
                value={phones[i]}
                onChange={(e) => update(i, e.target.value)}
                required
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Saving…" : "Unlock"}
          </Button>
        </form>

        <p className="text-[11px] leading-relaxed text-ink-400">
          We don&rsquo;t text your friends — we just record the numbers so we
          know it&rsquo;s real people.
        </p>
      </div>
    </Modal>
  );
}
