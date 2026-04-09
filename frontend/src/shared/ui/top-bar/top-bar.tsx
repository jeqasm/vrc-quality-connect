import { ReactNode } from 'react';

type TopBarProps = {
  title: string;
  subtitle?: string;
  dateRange?: ReactNode;
  action?: ReactNode;
};

export function TopBar(props: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-copy">
        <h1 className="top-bar-title">{props.title}</h1>
        {props.subtitle ? <p className="top-bar-subtitle">{props.subtitle}</p> : null}
      </div>

      <div className="top-bar-actions">
        {props.dateRange}
        {props.action}
      </div>
    </header>
  );
}
