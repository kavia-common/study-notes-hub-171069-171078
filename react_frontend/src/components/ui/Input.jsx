import React, { useId } from "react";

/**
 * PUBLIC_INTERFACE
 * Input: labeled text input with a11y support.
 *
 * Props:
 * - id?: string (auto-generated if not provided)
 * - label: string | ReactNode
 * - type?: string (default "text")
 * - value, defaultValue, onChange
 * - required?: boolean
 * - helpText?: string
 * - error?: string
 * - placeholder?: string
 * - inputProps?: props forwarded directly to <input>
 * - className?: string (for wrapper)
 */
export default function Input({
  id,
  label,
  type = "text",
  required = false,
  helpText = "",
  error = "",
  className = "",
  inputProps = {},
  ...rest
}) {
  const autoId = useId();
  const inputId = id || `ui-input-${autoId}`;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`ui-field ${className}`} {...rest}>
      {label ? (
        <label className="ui-label" htmlFor={inputId}>
          {label} {required ? <span className="text-muted" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      <input
        id={inputId}
        className="ui-input"
        type={type}
        aria-invalid={!!error}
        aria-describedby={[errorId, helpId].filter(Boolean).join(" ") || undefined}
        required={required || undefined}
        {...inputProps}
      />
      {error ? (
        <div id={errorId} role="alert" className="ui-error">
          {error}
        </div>
      ) : null}
      {helpText ? (
        <div id={helpId} className="ui-help">
          {helpText}
        </div>
      ) : null}
    </div>
  );
}
