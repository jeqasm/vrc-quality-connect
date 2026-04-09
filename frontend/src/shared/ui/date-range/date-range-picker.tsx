type DateRangeValue = {
  dateFrom: string;
  dateTo: string;
};

type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (nextValue: DateRangeValue) => void;
  variant?: 'toolbar' | 'panel';
};

export function DateRangePicker(props: DateRangePickerProps) {
  const containerClassName =
    props.variant === 'panel' ? 'panel-date-range' : 'toolbar-date-range';

  return (
    <div className={containerClassName}>
      <label className="toolbar-date-field">
        <span>Period</span>
        <input
          className="field-input"
          type="date"
          value={props.value.dateFrom}
          onChange={(event) =>
            props.onChange({
              ...props.value,
              dateFrom: event.target.value,
            })
          }
        />
      </label>

      <label className="toolbar-date-field">
        <span>To</span>
        <input
          className="field-input"
          type="date"
          value={props.value.dateTo}
          onChange={(event) =>
            props.onChange({
              ...props.value,
              dateTo: event.target.value,
            })
          }
        />
      </label>
    </div>
  );
}
