import React from "react";
import Spinner from "../ui/Spinner.jsx";

/**
 * PUBLIC_INTERFACE
 * LoadingState: Consistent loading/placeholder component with Ocean Professional styling.
 *
 * Props:
 * - title?: string (default "Loading…")
 * - description?: string
 * - inline?: boolean (if true, renders compact inline style)
 * - children?: ReactNode (optional extra content such as skeletons)
 * - "aria-label"?: string (accessible label override)
 */
export default function LoadingState({
  title = "Loading…",
  description = "Fetching data from the cloud.",
  inline = false,
  children = null,
  ...rest
}) {
  const Wrapper = inline ? "div" : "div";
  return (
    <Wrapper
      className={inline ? "" : "card"}
      role="status"
      aria-live="polite"
      {...rest}
      style={
        inline
          ? { display: "inline-flex", alignItems: "center", gap: 8 }
          : undefined
      }
    >
      {inline ? (
        <>
          <Spinner size="sm" />
          <span>{title}</span>
        </>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Spinner />
            <strong>{title}</strong>
          </div>
          {description ? (
            <p className="text-muted" style={{ margin: 0 }}>
              {description}
            </p>
          ) : null}
          {children}
        </div>
      )}
    </Wrapper>
  );
}
