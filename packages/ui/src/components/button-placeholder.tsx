import * as React from 'react';

export interface ButtonPlaceholderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const ButtonPlaceholder = React.forwardRef<HTMLButtonElement, ButtonPlaceholderProps>(
  ({ className, children, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`px-4 py-2 rounded font-medium transition-colors ${
          variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        } ${className || ''}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ButtonPlaceholder.displayName = 'ButtonPlaceholder';
