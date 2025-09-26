
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "w-full text-lg py-3 px-6 rounded-md shadow-md transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary";
  
  const variantClasses = {
    primary: "bg-brand-secondary text-brand-text hover:bg-brand-accent hover:text-brand-primary hover:shadow-glow focus:ring-brand-accent",
    secondary: "bg-transparent border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary focus:ring-brand-accent"
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
