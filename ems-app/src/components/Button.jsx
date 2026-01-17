// src/components/Button.jsx
import React from "react";
import "./header.css";

export default function Button({
  children,
  onClick,
  type = "primary", // primary, secondary, outline, danger
  size = "md", // sm, md, lg
  icon,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`btn btn-${type} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-label="Loading">⏳</span>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span className="btn-text">{children}</span>
        </>
      )}
    </button>
  );
}
