import React, { useState, useRef, useEffect } from 'react';

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
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
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
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "white",
    fontSize: '0.95rem',
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: '40px',
    boxSizing: 'border-box'
  };

  const mergedStyle = { ...defaultStyle, ...style };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={handleToggle}
        style={{
          ...mergedStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderColor: isOpen ? '#3B82F6' : '#D1D5DB',
          backgroundColor: isOpen ? '#F8FAFC' : 'white'
        }}
      >
        <span style={{ color: selectedOption ? '#374151' : '#9CA3AF' }}>
          {displayText}
        </span>
        <span style={{ 
          color: '#6B7280',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          ...(dropdownPosition === 'bottom' 
            ? { top: '100%', borderTop: 'none', borderRadius: '0 0 6px 6px' }
            : { bottom: '100%', borderBottom: 'none', borderRadius: '6px 6px 0 0' }
          ),
          left: '2px',
          right: '2px',
          backgroundColor: 'white',
          border: '1px solid #D1D5DB',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
          zIndex: 1000,
          maxHeight: '160px',
          overflowY: 'auto',
          margin: '0 -1px'
        }}>
          {placeholder && !value && (
            <div
              onClick={() => handleSelect('')}
              style={{
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#9CA3AF',
                backgroundColor: 'white',
                borderBottom: '1px solid #F3F4F6',
                fontSize: '0.95rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {placeholder}
            </div>
          )}
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#374151',
                backgroundColor: value === option.value ? '#EBF8FF' : 'white',
                borderBottom: '1px solid #F3F4F6',
                fontSize: '0.95rem'
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = value === option.value ? '#EBF8FF' : 'white';
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}