import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  id: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  id,
  options,
  value,
  onChange,
  icon,
  disabled = false,
  placeholder = 'Select...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="custom-select-group" ref={containerRef}>
      {label && (
        <label id={`${id}-label`} htmlFor={id} className="input-field-label">
          {label}
        </label>
      )}
      <div className="custom-select-wrapper">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${id}-label ${id}` : id}
          className={`custom-select-trigger ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          <div className="trigger-content">
            {icon && <span className="trigger-icon" aria-hidden="true">{icon}</span>}
            <span className={`trigger-label ${!selectedOption ? 'is-placeholder' : ''}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`chevron-icon ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul
            className="custom-select-dropdown"
            role="listbox"
            tabIndex={-1}
            aria-labelledby={label ? `${id}-label` : undefined}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`select-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={14} className="option-check-icon" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
