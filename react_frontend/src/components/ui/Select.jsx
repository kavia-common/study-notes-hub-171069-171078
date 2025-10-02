import React, { useId } from "react";

/**
 * PUBLIC_INTERFACE
 * Select: labeled select with a11y support.
 *
 * Props:
 * - id?: string
 * - label: string | ReactNode
 * - options: Array<{ value: string, label: string, disabled?: boolean }>
 * - value, defaultValue, onChange
 * - required?: boolean
 * - placeholder?: string (renders an initial option with empty value)
 * - helpText?: string
 * - error?: string
 * - selectProps?: props forwarded to <select>
 * - className?: string
 */
export default function Select({
  id,
  label,
  options = [],
  required = false,
  placeholder = "",
  helpText = "",
  error = "",
  className = "",
  selectProps = {},
  ...rest
}) {
  const autoId = useId();
  const selectId = id || `ui-select-${autoId}`;
  const helpId = helpText ? `${selectId}-help` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={`ui-field ${className}`} {...rest}>
      {label ? (
        <label className="ui-label" htmlFor={selectId}>
          {label} {required ? <span className="text-muted" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      <select
        id={selectId}
        className="ui-select"
        aria-invalid={!!error}
        aria-describedby={[errorId, helpId].filter(Boolean).join(" ") || undefined}
        required={required || undefined}
        {...selectProps}
      >
        {placeholder ? (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
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
