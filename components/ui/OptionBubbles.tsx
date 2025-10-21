import React, { useState } from 'react';
import { colors, transitions, spacing, borderRadius, touchTarget } from '../../styles/design-tokens';
import { triggerVeryLightHaptic } from '../../utils/haptics';

interface Option {
  value: string;
  label: string;
}

interface OptionBubblesProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  multiSelect?: boolean;
}

export function OptionBubbles({ options, value, onChange, name, multiSelect = false }: OptionBubblesProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const selectedValues = multiSelect ? value.split(',').filter(Boolean) : [value];

  const handleClick = (optionValue: string) => {
    triggerVeryLightHaptic();
    if (multiSelect) {
      const values = new Set(selectedValues);
      if (values.has(optionValue)) {
        values.delete(optionValue);
      } else {
        values.add(optionValue);
      }
      onChange(Array.from(values).join(','));
    } else {
      onChange(optionValue === value ? '' : optionValue);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
      {options.map((option) => {
        const id = `${name}-${option.value.replace(/\s+/g, '-')}`;
        const isSelected = selectedValues.includes(option.value);
        const isHovered = hoveredOption === option.value;

        return (
          <label
            htmlFor={id}
            key={option.value}
            onMouseEnter={() => setHoveredOption(option.value)}
            onMouseLeave={() => setHoveredOption(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: transitions.base,
            }}
          >
            <input
              id={id}
              type={multiSelect ? "checkbox" : "radio"}
              name={name}
              checked={isSelected}
              onChange={() => handleClick(option.value)}
              style={{ display: 'none' }} // Hide default input
            />
            <span style={{
                width: "16px",
                height: "16px",
                border: `2px solid ${isSelected ? colors.primary[500] : colors.neutral[300]}`,
                borderRadius: multiSelect ? '4px' : '50%',
                marginRight: "8px",
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: isSelected ? colors.primary[500] : colors.background.primary,
                transition: transitions.base,
            }}>
              {isSelected && (
                multiSelect ? (
                  // Checkmark for checkbox
                  <span style={{
                    width: '4px',
                    height: '8px',
                    border: 'solid white',
                    borderWidth: '0 2px 2px 0',
                    transform: 'rotate(45deg)',
                    marginTop: '-1px',
                  }} />
                ) : (
                  // Dot for radio
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white'
                  }} />
                )
              )}
            </span>
            <span style={{
              color: colors.neutral[900],
              fontSize: "0.9rem",
              transition: transitions.base,
            }}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
} 