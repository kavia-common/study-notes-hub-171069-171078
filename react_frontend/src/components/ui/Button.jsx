import React from "react";
import clsx from "clsx";

/**
 * PUBLIC_INTERFACE
 * Button: accessible, theme-styled button.
 *
 * Props:
 * - as?: "button" | "a" | React.ElementType (default "button")
 * - variant?: "primary" | "secondary" | "ghost" | "danger" (default "primary")
 * - size?: "sm" | "md" | "lg" (default "md")
 * - icon?: ReactNode (optional, leading icon)
 * - iconOnly?: boolean (renders square icon-only button)
 * - disabled?: boolean
 * - href?: string (when as="a")
 * - onClick?: () => void
 * - type?: "button" | "submit" | "reset"
 * - className?: string
 * - children?: ReactNode
 */
export default function Button({
  as = "button",
  variant = "primary",
  size = "md",
  icon = null,
  iconOnly = false,
  disabled = false,
  href,
  onClick,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const Comp = as;
  const classes = clsx(
    "ui-btn",
    variant === "secondary" && "ui-btn--secondary",
    variant === "ghost" && "ui-btn--ghost",
    variant === "danger" && "ui-btn--danger",
    size === "sm" && "ui-btn--sm",
    size === "lg" && "ui-btn--lg",
    iconOnly && "ui-btn--icon",
    className
  );

  const ariaProps =
    Comp === "button"
      ? { disabled }
      : { "aria-disabled": disabled || undefined, role: "button", tabIndex: disabled ? -1 : 0 };

  return (
    <Comp
      className={classes}
      href={Comp === "a" ? href : undefined}
      onClick={disabled ? undefined : onClick}
      type={Comp === "button" ? type : undefined}
      {...ariaProps}
      {...rest}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {!iconOnly && children}
    </Comp>
  );
}
