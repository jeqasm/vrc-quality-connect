import { DateInput } from '../date-input/date-input';

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
  const containerClassName =
    props.variant === 'panel' ? 'panel-date-range' : 'toolbar-date-range';

  return (
    <div className={containerClassName}>
      <label className="toolbar-date-field">
        <span>Period</span>
        <DateInput
          value={props.value.dateFrom}
          onChange={(dateFrom) =>
            props.onChange({
              ...props.value,
              dateFrom,
            })
          }
          clearAriaLabel="Очистить начальную дату"
          pickerAriaLabel="Открыть выбор начальной даты"
        />
      </label>

      <label className="toolbar-date-field">
        <span>To</span>
        <DateInput
          value={props.value.dateTo}
          onChange={(dateTo) =>
            props.onChange({
              ...props.value,
              dateTo,
            })
          }
          clearAriaLabel="Очистить конечную дату"
          pickerAriaLabel="Открыть выбор конечной даты"
        />
      </label>
    </div>
  );
}
