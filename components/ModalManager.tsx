"use client";

import { AuthModal } from "@/components/modals/AuthModal";
import { InfoModal } from "@/components/modals/InfoModal";
import { InviteModal } from "@/components/modals/InviteModal";
import { BatchJoinModal } from "@/components/modals/BatchJoinModal";
import { RefundConfirmModal } from "@/components/modals/RefundConfirmModal";

export function ModalManager() {
  return (
    <>
      <AuthModal />
      <InfoModal />
      <InviteModal />
      <BatchJoinModal />
      <RefundConfirmModal />
    </>
  );
}
