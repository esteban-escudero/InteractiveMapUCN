import { useCallback, useState } from "react";

/**
 * Hook para gestionar el modo de captura de coordenadas
 */
export const useCoordinateDetection = () => {
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
};
