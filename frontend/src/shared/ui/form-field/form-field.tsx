import { PropsWithChildren } from 'react';

export function FormField(props: PropsWithChildren<{ label: string; htmlFor: string }>) {
  return (
    <div className="field-grid">
      <label htmlFor={props.htmlFor}>{props.label}</label>
      {props.children}
    </div>
  );
}

