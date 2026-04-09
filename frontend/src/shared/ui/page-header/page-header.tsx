import { PropsWithChildren, ReactNode } from 'react';

type PageHeaderProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  meta?: ReactNode;
  actions?: ReactNode;
}>;

export function PageHeader(props: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-main">
        <div className="page-header-copy">
          {props.meta ? <div className="page-meta">{props.meta}</div> : null}
          <h1 className="page-title">{props.title}</h1>
          <p className="page-subtitle">{props.subtitle}</p>
        </div>
        {props.actions ? <div className="page-header-actions">{props.actions}</div> : null}
      </div>
      {props.children ? <div className="page-header-toolbar">{props.children}</div> : null}
    </header>
  );
}
