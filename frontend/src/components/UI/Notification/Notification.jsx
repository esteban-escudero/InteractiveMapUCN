import React, { useEffect } from "react";
import "./Notification.css";

const Notification = ({ 
  message, 
  type = "success", 
  onClose, 
  duration = 4000,
  position = "top-right"
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`notification notification-${type} notification-${position}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {getIcon()}
        </span>
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Notification;