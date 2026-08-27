"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getRecurringOptions } from "@/lib/api/recurring";
import { selectableFrequencies } from "../data/frequency-options";
import type { FrequencyOption } from "../types/frequency.model";

interface UseRecurringOptionsResult {
  options: FrequencyOption[];
  pending: boolean;
}

/**
 * The frequency picker's choices, fetched once by the page rather than by each
 * dialog — the add and edit dialogs would otherwise each fetch the same
 * unchanging reference data every time one is opened.
 */
export function useRecurringOptions(): UseRecurringOptionsResult {
  const [options, setOptions] = useState<FrequencyOption[]>([]);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let isActive = true;

    getRecurringOptions()
      .then((result) => {
        if (isActive) setOptions(selectableFrequencies(result));
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch recurring options:", error);
        if (isActive) {
          // Without this the picker would just be empty, which reads as "there
          // are no frequencies" rather than "the call failed".
          toast.error("Could not load the list of frequencies.");
        }
      })
      .finally(() => {
        if (isActive) setPending(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { options, pending };
}
