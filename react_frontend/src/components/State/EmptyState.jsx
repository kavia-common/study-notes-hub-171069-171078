import React from "react";

/**
 * PUBLIC_INTERFACE
 * EmptyState: Consistent empty results component.
 *
 * Props:
 * - title?: string (default "Nothing to show")
 * - message?: string
 * - actionLabel?: string
 * - onAction?: () => void
 * - icon?: ReactNode (optional emoji/icon)
 * - inline?: boolean (compact variant)
 * - children?: ReactNode (additional tips)
 */
export default function EmptyState({
  title = "Nothing to show",
  message = "Try adjusting your search or filters.",
  actionLabel,
  onAction,
  icon = "🌊",
  inline = false,
  children = null,
  ...rest
}) {
  const content = (
    <div style={{ display: "grid", gap: 8, placeItems: "start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span aria-hidden style={{ filter: "saturate(120%)" }}>{icon}</span>
        <strong>{title}</strong>
      </div>
      {message ? (
        <p className="text-muted" style={{ margin: 0 }}>
          {message}
        </p>
      ) : null}
      {children}
      {onAction && actionLabel ? (
        <div>
          <button className="btn" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );

  if (inline) {
    return (
      <div role="status" {...rest} style={{ display: "inline-grid", gap: 6 }}>
        {content}
      </div>
    );
  }

  return (
    <div className="card" role="status" {...rest}>
      {content}
    </div>
  );
}
