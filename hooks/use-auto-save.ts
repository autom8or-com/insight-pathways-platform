import { useEffect, useCallback, useRef, useState } from "react";
import { debounce } from "lodash";

interface AutoSaveOptions {
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: Error | null;
  manualSave: () => Promise<void>;
}

export function useAutoSave<T extends Record<string, any>>(
  data: T,
  options: AutoSaveOptions
): UseAutoSaveReturn {
  const { onSave, delay = 2000, enabled = true } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const previousDataRef = useRef<T>(data);
  const isDirtyRef = useRef(false);

  // Function to perform the actual save
  const performSave = useCallback(async (saveData: T) => {
    if (!enabled || !isDirtyRef.current) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(saveData);
      setLastSaved(new Date());
      isDirtyRef.current = false;
      previousDataRef.current = { ...saveData };
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error("Save failed"));
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, enabled]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((saveData: T) => {
      performSave(saveData);
    }, delay),
    [performSave, delay]
  );

  // Manual save function
  const manualSave = useCallback(async () => {
    isDirtyRef.current = true;
    await performSave(data);
  }, [performSave, data]);

  // Check if data has changed
  const hasDataChanged = useCallback((current: T, previous: T): boolean => {
    return JSON.stringify(current) !== JSON.stringify(previous);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    if (hasDataChanged(data, previousDataRef.current)) {
      isDirtyRef.current = true;
      debouncedSave(data);
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave, hasDataChanged]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    isSaving,
    lastSaved,
    saveError,
    manualSave,
  };
}