import { useEffect, useRef, useState } from 'react';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function Select(props: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeOption = props.options.find((option) => option.value === props.value) ?? null;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className={`ui-select ${props.className ?? ''}`.trim()} ref={rootRef}>
      <button
        type="button"
        className={`ui-select-trigger${isOpen ? ' ui-select-trigger-open' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
        disabled={props.disabled || props.options.length === 0}
      >
        <span className="ui-select-value">{activeOption?.label ?? '—'}</span>
        <span className="ui-select-chevron" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="ui-select-menu" role="listbox">
          {props.options.map((option) => {
            const isSelected = option.value === props.value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`ui-select-option${isSelected ? ' ui-select-option-selected' : ''}`}
                onClick={() => {
                  props.onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
