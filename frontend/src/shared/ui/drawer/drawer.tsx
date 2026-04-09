import { PropsWithChildren } from 'react';

type DrawerProps = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}>;

export function Drawer(props: DrawerProps) {
  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="overlay-root overlay-root-align-end" role="presentation" onClick={props.onClose}>
      <div className="overlay-backdrop" aria-hidden="true" />
      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="overlay-header">
          <div>
            <h2 className="overlay-title">{props.title}</h2>
            {props.description ? <p className="overlay-subtitle">{props.description}</p> : null}
          </div>
          <button className="icon-button" type="button" onClick={props.onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="overlay-content">{props.children}</div>
      </aside>
    </div>
  );
}
