import { ActivityRecord } from '../model/activity-record';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { ActivityRecordZoneDefinition } from '../model/activity-record-zone';

type ActivityRecordsTableProps = {
  records: ActivityRecord[];
  zone: ActivityRecordZoneDefinition;
  selectedRecordId?: string;
  onSelect: (record: ActivityRecord) => void;
  onAddRecord: () => void;
};

function formatHours(durationMinutes: number): string {
  return `${(Math.round((durationMinutes / 60) * 100) / 100).toFixed(2)} h`;
}

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}

export function ActivityRecordsTable(props: ActivityRecordsTableProps) {
  if (props.records.length === 0) {
    return (
      <EmptyState
        title="No records"
        message="No activity records match the current filters."
        action={
          <Button type="button" onClick={props.onAddRecord}>
            Add record
          </Button>
        }
      />
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Activity type</th>
            <th>Result</th>
            <th>Hours</th>
            <th>{props.zone.title}</th>
          </tr>
        </thead>
        <tbody>
          {props.records.map((record) => (
            <tr
              key={record.id}
              onClick={() => props.onSelect(record)}
              style={{
                backgroundColor:
                  props.selectedRecordId === record.id ? 'rgba(15, 118, 110, 0.08)' : undefined,
              }}
            >
              <td>{formatDate(record.workDate)}</td>
              <td>
                <div>{record.user.fullName}</div>
                <div className="table-secondary">{record.user.email}</div>
              </td>
              <td>{record.activityType.name}</td>
              <td>{record.activityResult.name}</td>
              <td>{formatHours(record.durationMinutes)}</td>
              <td>
                <div>{record.title}</div>
                {record.description ? (
                  <div className="table-secondary">{record.description}</div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
