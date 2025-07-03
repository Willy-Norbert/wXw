
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = <T>({
  data,
  onSave,
  delay = 2000,
  enabled = true
}: UseAutoSaveOptions<T>) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (!enabled || isInitialRender.current) {
      isInitialRender.current = false;
      previousDataRef.current = data;
      return;
    }

    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        console.log('✅ Auto-saved successfully');
        toast({
          title: "Auto-saved",
          description: "Your changes have been saved automatically.",
          duration: 2000,
        });
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
        toast({
          title: "Auto-save failed",
          description: "Failed to save your changes. Please save manually.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }, delay);

    previousDataRef.current = data;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled, toast]);

  return {
    triggerSave: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onSave(data);
    }
  };
};
