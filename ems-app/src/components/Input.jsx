// src/components/Input.jsx
import React, { forwardRef } from "react";
import "./header.css";

const Input = forwardRef(({ label, error, icon, className = "", ...props }, ref) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-wrapper ${icon ? "has-icon" : ""}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          ref={ref}
          className={`input-field ${error ? "input-error" : ""}`}
          {...props}
        />
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
});

Input.displayName = "Input"; // ✅ ensures React DevTools compatibility

export default Input;
