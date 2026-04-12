import { useRef } from 'react';

type DateRangeValue = {
  dateFrom: string;
  dateTo: string;
};

type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (nextValue: DateRangeValue) => void;
  variant?: 'toolbar' | 'panel';
  allowEmpty?: boolean;
};

export function DateRangePicker(props: DateRangePickerProps) {
  const dateFromInputRef = useRef<HTMLInputElement | null>(null);
  const dateToInputRef = useRef<HTMLInputElement | null>(null);
  const containerClassName =
    props.variant === 'panel' ? 'panel-date-range' : 'toolbar-date-range';

  return (
    <div className={containerClassName}>
      <label className="toolbar-date-field">
        <span>Period</span>
        <span className="date-field-control">
          <input
            ref={dateFromInputRef}
            className="field-input date-field-input"
            type="date"
            value={props.value.dateFrom}
            onChange={(event) =>
              props.onChange({
                ...props.value,
                dateFrom: event.target.value,
              })
            }
          />
          <button
            type="button"
            className="date-picker-icon-button"
            onClick={() => {
              dateFromInputRef.current?.showPicker?.();
              dateFromInputRef.current?.focus();
            }}
            aria-label="Открыть выбор начальной даты"
          >
            <span className="date-picker-icon" aria-hidden="true" />
          </button>
          {props.allowEmpty ? (
            <button
              type="button"
              className="date-clear-icon-button"
              onClick={() =>
                props.onChange({
                  ...props.value,
                  dateFrom: '',
                })
              }
              aria-label="Очистить начальную дату"
            >
              <span className="date-clear-icon" aria-hidden="true" />
            </button>
          ) : null}
        </span>
      </label>

      <label className="toolbar-date-field">
        <span>To</span>
        <span className="date-field-control">
          <input
            ref={dateToInputRef}
            className="field-input date-field-input"
            type="date"
            value={props.value.dateTo}
            onChange={(event) =>
              props.onChange({
                ...props.value,
                dateTo: event.target.value,
              })
            }
          />
          <button
            type="button"
            className="date-picker-icon-button"
            onClick={() => {
              dateToInputRef.current?.showPicker?.();
              dateToInputRef.current?.focus();
            }}
            aria-label="Открыть выбор конечной даты"
          >
            <span className="date-picker-icon" aria-hidden="true" />
          </button>
          {props.allowEmpty ? (
            <button
              type="button"
              className="date-clear-icon-button"
              onClick={() =>
                props.onChange({
                  ...props.value,
                  dateTo: '',
                })
              }
              aria-label="Очистить конечную дату"
            >
              <span className="date-clear-icon" aria-hidden="true" />
            </button>
          ) : null}
        </span>
      </label>
    </div>
  );
}
