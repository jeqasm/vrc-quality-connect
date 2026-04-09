import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field-input ${props.className ?? ''}`.trim()} />;
}

