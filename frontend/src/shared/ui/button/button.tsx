import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassNameMap: Record<ButtonVariant, string> = {
  primary: 'primary-button',
  secondary: 'secondary-button',
  ghost: 'ghost-button',
};

export function Button({ className, variant = 'primary', ...restProps }: ButtonProps) {
  return (
    <button
      {...restProps}
      className={`${variantClassNameMap[variant]} ${className ?? ''}`.trim()}
    />
  );
}
