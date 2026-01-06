import React from "react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = "warning",
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "warning":
        return "warning";
      case "danger":
        return "error";
      case "info":
        return "info";
      default:
        return "help";
    }
  };

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <span className="material-icons confirm-dialog-icon">
            {getIcon()}
          </span>
          <h3>{title}</h3>
        </div>

        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>

        <div className="confirm-dialog-actions">
          <button className="confirm-dialog-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`confirm-dialog-confirm confirm-dialog-${type}`}
            onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
