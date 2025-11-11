import { useState, useCallback } from "react";

export const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showUINotification = useCallback((message, type = "success") => {
    setNotification({
      show: true,
      message,
      type,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    notification,
    showUINotification,
    hideNotification,
  };
};
