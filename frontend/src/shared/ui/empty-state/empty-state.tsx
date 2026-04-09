import { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  message?: string;
  action?: ReactNode;
};

export function EmptyState(props: EmptyStateProps) {
  return (
    <div className="feedback-card">
      <div className="feedback-title">{props.title}</div>
      {props.message ? <div className="feedback-message">{props.message}</div> : null}
      {props.action ? <div className="feedback-actions">{props.action}</div> : null}
    </div>
  );
}
