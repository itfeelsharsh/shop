import React from 'react';
import { m } from "framer-motion";
import { buttonHover } from '../utils/animations';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-primary-500 hover:bg-primary-50',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
};

const sizes = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg'
};

const buttonAnimation = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  disabled: { opacity: 0.6 }
};

const spinnerAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  isLoading = false,
  disabled = false,
  icon = null,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed';
  
  return (
    <m.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      animate={disabled ? "disabled" : "rest"}
      variants={buttonAnimation}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <m.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          variants={spinnerAnimation}
          animate="animate"
        >
          <svg
            className="w-5 h-5 text-white animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </m.div>
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </span>
    </m.button>
  );
}

export default Button; 