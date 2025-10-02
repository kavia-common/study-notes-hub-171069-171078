import React, { useCallback, useEffect, useRef } from "react";
import Button from "./Button.jsx";

/**
 * PUBLIC_INTERFACE
 * Modal: accessible modal dialog with focus trap and ESC / overlay close.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void (called on ESC or overlay click)
 * - title?: string | ReactNode
 * - children?: ReactNode
 * - footer?: ReactNode
 * - initialFocusRef?: React.RefObject<HTMLElement> (which element to focus first)
 * - closeOnOverlay?: boolean (default true)
 * - labelledById?: string (custom aria-labelledby, uses internal if not provided)
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer = null,
  initialFocusRef,
  closeOnOverlay = true,
  labelledById,
}) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const defaultTitleId = useRef(`ui-modal-title-${Math.random().toString(36).slice(2)}`);

  // Close on ESC
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
      // Focus trap: Tab key within dialog
      if (e.key === "Tab") {
        const focusable = getFocusable(dialogRef.current);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  // Open/Close side-effects
  useEffect(() => {
    if (open) {
      // Save currently focused element
      lastFocusedRef.current = document.activeElement;
      // Attach listeners
      document.addEventListener("keydown", onKeyDown, true);
      // Set focus inside modal
      setTimeout(() => {
        const el = initialFocusRef?.current || dialogRef.current?.querySelector("[data-autofocus]") || getFocusable(dialogRef.current)[0];
        el?.focus?.();
      }, 0);
      // Prevent background scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.removeEventListener("keydown", onKeyDown, true);
        // Restore focus
        if (lastFocusedRef.current && lastFocusedRef.current.focus) {
          lastFocusedRef.current.focus();
        }
      };
    }
    return undefined;
  }, [open, onKeyDown, initialFocusRef]);

  if (!open) return null;

  const onOverlayClick = (e) => {
    if (closeOnOverlay && e.target === overlayRef.current) {
      onClose?.();
    }
  };

  const ariaLabelledBy = labelledById || (title ? defaultTitleId.current : undefined);

  return (
    <div className="ui-modal-overlay" ref={overlayRef} onMouseDown={onOverlayClick} aria-modal="true" role="dialog">
      <div className="ui-modal" ref={dialogRef} aria-labelledby={ariaLabelledBy}>
        <div className="ui-modal__header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            {title ? <h2 id={ariaLabelledBy} className="ui-modal__title">{title}</h2> : <span aria-hidden />}
            <Button variant="ghost" size="sm" aria-label="Close dialog" onClick={onClose} iconOnly icon="✕" />
          </div>
        </div>
        <div className="ui-modal__body">{children}</div>
        {footer !== null ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function getFocusable(root) {
  if (!root) return [];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
  ];
  return Array.from(root.querySelectorAll(selectors.join(","))).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}
