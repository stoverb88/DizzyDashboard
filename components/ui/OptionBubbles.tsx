import React from 'react';

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
  const selectedValues = multiSelect ? value.split(',').filter(Boolean) : [value];

  const handleClick = (optionValue: string) => {
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

        return (
          <label htmlFor={id} key={option.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
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
                border: `1px solid ${isSelected ? '#7C3AED' : '#D1D5DB'}`,
                borderRadius: multiSelect ? '4px' : '50%', // Rounded square for checkbox, circle for radio
                marginRight: "8px",
                display: 'inline-block',
                position: 'relative',
                backgroundColor: isSelected ? '#7C3AED' : 'white',
                transition: 'all 0.2s ease',
            }}>
              {isSelected && (
                multiSelect ? (
                  // Checkmark for checkbox
                  <span style={{
                    position: 'absolute',
                    left: '5px',
                    top: '2px',
                    width: '4px',
                    height: '8px',
                    border: 'solid white',
                    borderWidth: '0 2px 2px 0',
                    transform: 'rotate(45deg)',
                  }} />
                ) : (
                  // Dot for radio
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white'
                  }} />
                )
              )}
            </span>
            <span style={{ color: "#374151", fontSize: "0.9rem" }}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
} 