import { InputHTMLAttributes, useRef } from 'react';

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string;
  onChange: (nextValue: string) => void;
  controlSize?: 'default' | 'compact';
  pickerAriaLabel?: string;
  clearAriaLabel?: string;
};

export function DateInput({
  className,
  value,
  onChange,
  controlSize = 'default',
  pickerAriaLabel = 'Открыть выбор даты',
  clearAriaLabel = 'Очистить дату',
  ...restProps
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const controlClassName =
    controlSize === 'compact' ? 'date-field-control date-field-control-compact' : 'date-field-control';

  return (
    <span className={controlClassName}>
      <input
        {...restProps}
        ref={inputRef}
        className={`field-input date-field-input ${className ?? ''}`.trim()}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="date-picker-icon-button"
        onClick={() => {
          inputRef.current?.showPicker?.();
          inputRef.current?.focus();
        }}
        aria-label={pickerAriaLabel}
      >
        <span className="date-picker-icon" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="date-clear-icon-button"
        onClick={() => onChange('')}
        aria-label={clearAriaLabel}
      >
        <span className="date-clear-icon" aria-hidden="true" />
      </button>
    </span>
  );
}
