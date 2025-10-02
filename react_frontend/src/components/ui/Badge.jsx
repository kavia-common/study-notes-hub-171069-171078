import React from "react";
import clsx from "clsx";

/**
 * PUBLIC_INTERFACE
 * Badge: small status indicator.
 *
 * Props:
 * - tone?: "default" | "primary" | "success" | "danger" (default "default")
 * - children?: ReactNode
 * - className?: string
 * - title?: string
 */
export default function Badge({ tone = "default", children, className = "", title, ...rest }) {
  const classes = clsx(
    "ui-badge",
    tone === "primary" && "ui-tag--primary",
    tone === "success" && "ui-tag--success",
    tone === "danger" && "ui-tag--danger",
    className
  );
  return (
    <span className={classes} title={title} {...rest}>
      {children}
    </span>
  );
}
