import React from "react";

/**
 * PUBLIC_INTERFACE
 * ErrorState: Consistent error/alert component.
 *
 * Props:
 * - title?: string (default "Something went wrong")
 * - message?: string
 * - onRetry?: () => void (renders a Retry button if provided)
 * - actionLabel?: string (default "Retry")
 * - inline?: boolean (if true, renders compact inline style)
 * - children?: ReactNode (additional details)
 */
export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
  actionLabel = "Retry",
  inline = false,
  children = null,
  ...rest
}) {
  const content = (
    <div style={{ display: "grid", gap: 6 }}>
      <strong style={{ color: "var(--color-error)" }}>{title}</strong>
      {message ? (
        <p className="text-muted" style={{ margin: 0 }}>
          {message}
        </p>
      ) : null}
      {children}
      {onRetry ? (
        <div style={{ marginTop: 6 }}>
          <button className="btn ghost" onClick={onRetry} aria-label={actionLabel}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );

  if (inline) {
    return (
      <div role="alert" aria-live="assertive" {...rest} style={{ display: "inline-grid", gap: 6 }}>
        {content}
      </div>
    );
  }

  return (
    <div
      className="card"
      role="alert"
      aria-live="assertive"
      {...rest}
      style={{ borderColor: "var(--color-error)" }}
    >
      {content}
    </div>
  );
}
