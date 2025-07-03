
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveProps {
  data: any;
  onSave?: (data: any) => void;
  delay?: number;
  storageKey: string;
}

export const useAutoSave = ({ data, onSave, delay = 2000, storageKey }: UseAutoSaveProps) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>('');

  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    
    if (currentDataString !== previousDataRef.current && currentDataString !== '{}') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        localStorage.setItem(storageKey, currentDataString);
        
        if (onSave) {
          onSave(data);
        }

        toast({
          title: "Auto-saved",
          description: "Your changes have been automatically saved",
          duration: 2000,
        });
      }, delay);

      previousDataRef.current = currentDataString;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, storageKey, toast]);

  const getSavedData = () => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  };

  const clearSavedData = () => {
    localStorage.removeItem(storageKey);
  };

  return { getSavedData, clearSavedData };
};
