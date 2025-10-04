
"use client";

import { useState, useEffect } from 'react';

// A custom hook to debounce any fast-changing value
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
    useEffect(() => {
      // Set debouncedValue to value (passed in) after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      // Return a cleanup function that will be called every time ...
      // ... useEffect is re-called or on unmount.
      return () => {
        clearTimeout(handler);
      };
    },
    // Only re-call effect if value or delay changes
    [value, delay]);
  
    return debouncedValue;
}
