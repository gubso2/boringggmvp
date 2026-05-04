"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { useApp } from "@/components/AppProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { normalizePhone } from "@/lib/invites";

export function AuthModal() {
  const { modal, setModal } = useApp();
  const open = modal.kind === "auth";
  const next = modal.kind === "auth" ? modal.next : undefined;

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setStep("phone");
    setPhoneInput("");
    setCode("");
    setError(null);
    setNormalizedPhone(null);
    setModal({ kind: "none" });
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const phone = normalizePhone(phoneInput);
    if (!phone) {
      setError("Enter a phone number in international format (e.g. +14155550123).");
      return;
    }
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNormalizedPhone(phone);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!normalizedPhone) return;
    setError(null);
    if (code.replace(/\D/g, "").length < 4) {
      setError("Enter the 6-digit code we just texted you.");
      return;
    }
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: code.trim(),
      type: "sms",
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    const cb = next;
    close();
    cb?.();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={step === "phone" ? "Sign in" : "Enter code"}
    >
      {step === "phone" ? (
        <form onSubmit={sendCode} className="space-y-4">
          <p className="text-sm text-ink-500">
            We&rsquo;ll text you a one-time code. No password, no email.
          </p>
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-medium text-ink-700"
            >
              Phone number
            </label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+1 415 555 0123"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-sm text-ink-500">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-ink-950">{normalizedPhone}</span>.
          </p>
          <div>
            <label
              htmlFor="code"
              className="mb-1.5 block text-xs font-medium text-ink-700"
            >
              Verification code
            </label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              maxLength={6}
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
              className="sm:flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              className="sm:flex-[2]"
              disabled={busy}
            >
              {busy ? "Verifying…" : "Verify & continue"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
