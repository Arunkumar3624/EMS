// src/components/Card.jsx
import React from "react";
import "./header.css";

export default function Card({
  icon,
  title = "",
  description = "",
  footer = null,
  badge = null,
  onClick = null,
  className = "",
  hover = true,
}) {
  const isClickable = typeof onClick === "function";

  return (
    <div
      className={`card ${hover ? "card-hover" : ""} ${isClickable ? "clickable" : ""} ${className}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {badge && <div className="card-badge">{badge}</div>}
      {icon && <div className="card-icon">{icon}</div>}
      {title && <h3 className="card-title">{title}</h3>}
      {description && <p className="card-description">{description}</p>}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
