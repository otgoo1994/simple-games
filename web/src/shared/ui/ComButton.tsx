/* eslint-disable react/require-default-props */
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  btnId?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant: 'primary' | 'warning' | 'dark' | 'light' | 'dark-blue';
}

export const ComButton = ({
  btnId,
  type,
  className,
  label,
  leftIcon,
  rightIcon,
  variant,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type ?? 'button'}
      id={btnId}
      className={`button ${variant === 'warning' && 'warning'} ${variant === 'primary' && 'primary'} ${variant === 'dark' && 'dark'} ${variant === 'light' && 'light'} ${variant === 'dark-blue' && 'dark-blue'}`}
      {...props}
    >
      {leftIcon && leftIcon}
      <span>{label}</span>
      {rightIcon && rightIcon}
    </button>
  );
};
