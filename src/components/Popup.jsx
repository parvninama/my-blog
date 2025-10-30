import React, { useEffect } from "react";

function Popup({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white ${
        type === "error" ? "bg-red-500" : "bg-blue-500"
      }`}
    >
      {message}
    </div>
  );
}

export default Popup;
