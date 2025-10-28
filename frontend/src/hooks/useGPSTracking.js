import { useState, useCallback } from "react";

export function useGPSTracking() {
  const [isActive, setIsActive] = useState(false);

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const activate = useCallback(() => {
    setIsActive(true);
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    toggle,
    activate,
    deactivate,
  };
}
