import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'white';
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const styles = {
    primary: 'bg-primary text-white hover:bg-slate-800 shadow-soft',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm',
    accent: 'bg-accent text-white hover:bg-blue-600 shadow-soft',
    white: 'bg-white text-slate-800 hover:bg-slate-50 shadow-soft',
  };

  return (
    <button
      className={`
        ${styles[variant]}
        px-6 py-3 rounded-full font-medium transition-all duration-200
        active:scale-95
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
