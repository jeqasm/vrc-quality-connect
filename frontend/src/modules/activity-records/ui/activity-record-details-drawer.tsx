import { Drawer } from '../../../shared/ui/drawer/drawer';
import { ActivityRecord } from '../model/activity-record';

type ActivityRecordDetailsDrawerProps = {
  record: ActivityRecord | null;
  onClose: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(date);
}

function formatHours(durationMinutes: number): string {
  return `${(durationMinutes / 60).toFixed(2)} h`;
}

export function ActivityRecordDetailsDrawer(props: ActivityRecordDetailsDrawerProps) {
  const record = props.record;

  return (
    <Drawer
      isOpen={Boolean(record)}
      title={record ? record.title : 'Record details'}
      description={record ? `${record.user.fullName} • ${record.activityType.name}` : undefined}
      onClose={props.onClose}
    >
      {record ? (
        <div className="stack-md">
          <div className="pill-row">
            <span className="pill">{record.activityResult.name}</span>
            <span className="pill pill-neutral">{formatHours(record.durationMinutes)}</span>
          </div>

          {record.description ? (
            <div className="activity-highlight">
              <div className="field-label">Description</div>
              <div>{record.description}</div>
            </div>
          ) : null}

          <div className="details-list">
            <div className="details-row">
              <span className="muted-text">Work date</span>
              <strong>{formatDate(record.workDate)}</strong>
            </div>
            <div className="details-row">
              <span className="muted-text">Employee</span>
              <strong>{record.user.fullName}</strong>
            </div>
            <div className="details-row">
              <span className="muted-text">Email</span>
              <strong>{record.user.email}</strong>
            </div>
            <div className="details-row">
              <span className="muted-text">Department</span>
              <strong>{record.department.name}</strong>
            </div>
            <div className="details-row">
              <span className="muted-text">Activity type</span>
              <strong>{record.activityType.name}</strong>
            </div>
            <div className="details-row">
              <span className="muted-text">Result</span>
              <strong>{record.activityResult.name}</strong>
            </div>
            {record.externalId ? (
              <div className="details-row">
                <span className="muted-text">External ID</span>
                <strong>{record.externalId}</strong>
              </div>
            ) : null}
            {record.externalUrl ? (
              <div className="details-row">
                <span className="muted-text">External URL</span>
                <a href={record.externalUrl} target="_blank" rel="noreferrer">
                  Open link
                </a>
              </div>
            ) : null}
            {record.comment ? (
              <div className="activity-highlight">
                <div className="field-label">Comment</div>
                <div>{record.comment}</div>
              </div>
            ) : null}
          </div>

          <div className="details-list">
            <div className="details-row">
              <span className="muted-text">Created</span>
              <strong>{formatDate(record.createdAt)}</strong>
            </div>
            <div className="details-row">
              <span className="muted-text">Updated</span>
              <strong>{formatDate(record.updatedAt)}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
