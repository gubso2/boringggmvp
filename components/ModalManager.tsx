"use client";

import { AuthModal } from "@/components/modals/AuthModal";
import { InfoModal } from "@/components/modals/InfoModal";
import { InviteModal } from "@/components/modals/InviteModal";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { RefundConfirmModal } from "@/components/modals/RefundConfirmModal";

export function ModalManager() {
  return (
    <>
      <AuthModal />
      <InfoModal />
      <InviteModal />
      <CheckoutModal />
      <RefundConfirmModal />
    </>
  );
}
