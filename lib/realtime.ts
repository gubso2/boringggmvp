"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "./supabase/client";
import type { Batch } from "./types";

/**
 * Subscribes to UPDATEs on a batch row via Supabase Realtime.
 * Returns the latest known batch state.
 */
export function useBatchRealtime(initialBatch: Batch): Batch {
  const [batch, setBatch] = useState<Batch>(initialBatch);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`batch:${initialBatch.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "batches",
          filter: `id=eq.${initialBatch.id}`,
        },
        (payload) => {
          setBatch(payload.new as Batch);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialBatch.id]);

  return batch;
}
