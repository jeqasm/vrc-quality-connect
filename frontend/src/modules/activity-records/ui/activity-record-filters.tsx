import { Button } from '../../../shared/ui/button/button';
import { FormEvent } from 'react';

import { ReferenceDataBundle } from '../../reference-data/model/reference-data';
import { ActivityRecordZoneDefinition } from '../model/activity-record-zone';

type ActivityRecordFiltersFormValues = {
  userId: string;
  departmentId: string;
  activityTypeId: string;
  dateFrom: string;
  dateTo: string;
};

type ActivityRecordFiltersProps = {
  referenceData: ReferenceDataBundle;
  zone: ActivityRecordZoneDefinition;
  values: ActivityRecordFiltersFormValues;
  onChange: (name: keyof ActivityRecordFiltersFormValues, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export function ActivityRecordFilters(props: ActivityRecordFiltersProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit();
  }

  return (
    <form className="filters-grid" onSubmit={handleSubmit}>
      <label className="field-grid">
        <span>Employee</span>
        <select
          className="field-select"
          value={props.values.userId}
          onChange={(event) => props.onChange('userId', event.target.value)}
        >
          <option value="">All employees</option>
          {props.referenceData.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </select>
      </label>

      <label className="field-grid">
        <span>Department</span>
        <select
          className="field-select"
          value={props.values.departmentId}
          onChange={(event) => props.onChange('departmentId', event.target.value)}
          disabled
        >
          <option value="">{props.zone.title}</option>
          {props.referenceData.departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-grid">
        <span>Activity type</span>
        <select
          className="field-select"
          value={props.values.activityTypeId}
          onChange={(event) => props.onChange('activityTypeId', event.target.value)}
        >
          <option value="">All activity types</option>
          {props.referenceData.activityTypes.map((activityType) => (
            <option key={activityType.id} value={activityType.id}>
              {activityType.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-grid">
        <span>Date from</span>
        <input
          className="field-input"
          type="date"
          value={props.values.dateFrom}
          onChange={(event) => props.onChange('dateFrom', event.target.value)}
        />
      </label>

      <label className="field-grid">
        <span>Date to</span>
        <input
          className="field-input"
          type="date"
          value={props.values.dateTo}
          onChange={(event) => props.onChange('dateTo', event.target.value)}
        />
      </label>

      <div className="filters-actions">
        <Button variant="secondary" type="button" onClick={props.onReset}>
          Reset
        </Button>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
}
