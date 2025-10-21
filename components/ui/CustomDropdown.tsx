import React, { useState, useRef, useEffect } from 'react';
import { colors, shadows, borderRadius, transitions, zIndex, touchTarget } from '../../styles/design-tokens';
import { triggerVeryLightHaptic } from '../../utils/haptics';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function CustomDropdown({ options, value, onChange, placeholder = "Select...", style }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    triggerVeryLightHaptic();
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    triggerVeryLightHaptic();
    if (!isOpen && dropdownRef.current) {
      // Check if there's enough space below, otherwise show above
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(160, options.length * 40 + 20); // Estimated height

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const defaultStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: borderRadius.md,
    border: `2px solid ${isFocused || isOpen ? colors.primary[500] : colors.neutral[300]}`,
    backgroundColor: colors.background.primary,
    fontSize: '0.95rem',
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: touchTarget.minimum,
    boxSizing: 'border-box',
    transition: transitions.base,
    boxShadow: isFocused || isOpen ? shadows.focus : 'none',
  };

  const mergedStyle = { ...defaultStyle, ...style };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={handleToggle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          ...mergedStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: selectedOption ? colors.neutral[900] : colors.neutral[400] }}>
          {displayText}
        </span>
        <span style={{
          color: colors.neutral[600],
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: transitions.fast,
          fontSize: '12px',
        }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            ...(dropdownPosition === 'bottom'
              ? { top: 'calc(100% + 4px)', borderRadius: borderRadius.md }
              : { bottom: 'calc(100% + 4px)', borderRadius: borderRadius.md }
            ),
            left: 0,
            right: 0,
            backgroundColor: colors.background.primary,
            border: `2px solid ${colors.primary[500]}`,
            boxShadow: shadows.lg,
            zIndex: zIndex.dropdown,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {placeholder && !value && (
            <div
              onClick={() => handleSelect('')}
              role="option"
              aria-selected={false}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                color: colors.neutral[400],
                backgroundColor: colors.background.primary,
                borderBottom: `1px solid ${colors.neutral[100]}`,
                fontSize: '0.95rem',
                transition: transitions.fast,
                minHeight: touchTarget.minimum,
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral[50]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.background.primary}
            >
              {placeholder}
            </div>
          )}
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                color: colors.neutral[900],
                backgroundColor: value === option.value ? colors.primary[50] : colors.background.primary,
                borderBottom: `1px solid ${colors.neutral[100]}`,
                fontSize: '0.95rem',
                transition: transitions.fast,
                minHeight: touchTarget.minimum,
                display: 'flex',
                alignItems: 'center',
                fontWeight: value === option.value ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = value === option.value ? colors.primary[50] : colors.background.primary;
              }}
            >
              {option.label}
              {value === option.value && (
                <span style={{ marginLeft: 'auto', color: colors.primary[600], fontSize: '16px' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}