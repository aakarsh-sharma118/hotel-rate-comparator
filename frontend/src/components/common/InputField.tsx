import React, { useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  icon?: React.ReactNode;
  helperText?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  icon,
  helperText,
  error,
  className = '',
  onClick,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPickerIfDate = () => {
    if (props.type === 'date' && !props.disabled && inputRef.current) {
      try {
        if (typeof inputRef.current.showPicker === 'function') {
          inputRef.current.showPicker();
        } else {
          inputRef.current.focus();
        }
      } catch {
        inputRef.current.focus();
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    openPickerIfDate();
    onClick?.(e);
  };

  return (
    <div className="input-field-group">
      <label htmlFor={id} className="input-field-label">
        {label}
      </label>
      <div
        className="input-field-wrapper"
        onClick={(e) => {
          if (e.target !== inputRef.current) {
            openPickerIfDate();
          }
        }}
      >
        <input
          ref={inputRef}
          id={id}
          className={`input-field-control ${icon ? 'has-icon' : ''} ${error ? 'is-invalid' : ''} ${className}`}
          onClick={handleInputClick}
          {...props}
        />
        {icon && (
          <span
            className="input-field-icon"
            aria-hidden="true"
            onClick={openPickerIfDate}
            style={{ cursor: props.type === 'date' ? 'pointer' : undefined }}
          >
            {icon}
          </span>
        )}
        {error && (
          <div className="search-error-bubble" role="alert">
            <AlertCircle size={13} className="bubble-alert-icon" aria-hidden="true" />
            <span className="bubble-text">{error}</span>
          </div>
        )}
      </div>
      {helperText && !error ? (
        <span className="input-field-helper">{helperText}</span>
      ) : null}
    </div>
  );
};

export default InputField;
