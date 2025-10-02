import React from "react";
import clsx from "clsx";

/**
 * PUBLIC_INTERFACE
 * Spinner: simple animated spinner.
 *
 * Props:
 * - size?: "sm" | "md" | "lg" (default "md")
 * - label?: string (for accessible name; hidden visually)
 * - className?: string
 */
export default function Spinner({ size = "md", label = "Loading", className = "", ...rest }) {
  const classes = clsx(
    "ui-spinner",
    size === "sm" && "ui-spinner--sm",
    size === "lg" && "ui-spinner--lg",
    className
  );
  return (
    <span className={classes} role="status" aria-live="polite" aria-label={label} {...rest} />
  );
}
