import React from "react";
import clsx from "clsx";

/**
 * PUBLIC_INTERFACE
 * Tag: pill label for categorization.
 *
 * Props:
 * - tone?: "default" | "primary" | "success" | "danger" (default "default")
 * - children?: ReactNode
 * - className?: string
 * - onClick?: () => void (becomes button-like)
 * - title?: string
 */
export default function Tag({ tone = "default", children, className = "", onClick, title, ...rest }) {
  const classes = clsx(
    "ui-tag",
    tone === "primary" && "ui-tag--primary",
    tone === "success" && "ui-tag--success",
    tone === "danger" && "ui-tag--danger",
    className
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} title={title} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <span className={classes} title={title} {...rest}>
      {children}
    </span>
  );
}
