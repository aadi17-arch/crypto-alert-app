import React, { useEffect } from "react";

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const toastIcons = {
    success: "OK",
    error: "!",
    info: "i"
  };

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <span className="toast__icon">{toastIcons[type] || toastIcons.info}</span>
      <span className="toast__message">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="toast__close"
        aria-label="Close notification"
      >
        x
      </button>
    </div>
  );
}

export default Toast;
