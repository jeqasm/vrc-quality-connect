import { TextareaHTMLAttributes } from 'react';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field-textarea ${props.className ?? ''}`.trim()} />;
}

