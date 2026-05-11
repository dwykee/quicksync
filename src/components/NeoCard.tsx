import React from 'react';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'primary' | 'secondary' | 'accent' | 'glass';
}

export const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  className = '', 
  variant = 'white',
  ...props 
}) => {
  const styles = {
    white: 'bg-white border border-slate-100 shadow-soft',
    primary: 'bg-primary text-white shadow-soft-lg',
    secondary: 'bg-secondary border border-slate-200',
    accent: 'bg-accent text-white shadow-soft',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-glass',
  };

  return (
    <div
      className={`
        ${styles[variant]}
        rounded-3xl p-6 md:p-8
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
