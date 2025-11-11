// hooks/useConfirm.js
import { useState, useCallback } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
    confirmText: "Confirmar",
    cancelText: "Cancelar"
  });

  const showConfirm = useCallback((title, message, onConfirm, options = {}) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm,
      type: options.type || "warning",
      confirmText: options.confirmText || "Confirmar",
      cancelText: options.cancelText || "Cancelar"
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
    hideConfirm();
  }, [confirmState.onConfirm, hideConfirm]);

  return {
    confirmState,
    showConfirm,
    hideConfirm,
    handleConfirm
  };
};