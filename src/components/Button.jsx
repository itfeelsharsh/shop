import React from 'react';
import { m } from "framer-motion";

const variants = {
  primary: 'bg-[#D32F2F] hover:bg-[#C62828] text-white shadow-md active:bg-[#B71C1C] btn-shiny-ribbon btn-shopify',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm',
  outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md active:bg-red-800',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:bg-emerald-800'
};

const sizes = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-2.5 text-base',
  large: 'px-8 py-3.5 text-lg'
};

const buttonAnimation = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeIn" }
  },
  loading: {
    backgroundColor: "#f3f4f6", // gray-100
    color: "#9ca3af", // gray-400
    scale: 0.98,
    cursor: "not-allowed"
  },
  disabled: { 
    opacity: 0.5,
    cursor: "not-allowed"
  }
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
  loadingText = '',
  disabled = false,
  icon = null,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:pointer-events-none relative overflow-hidden';
  
  return (
    <m.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      initial="rest"
      whileHover={isLoading || disabled ? "" : "hover"}
      whileTap={isLoading || disabled ? "" : "tap"}
      animate={isLoading ? "loading" : (disabled ? "disabled" : "rest")}
      variants={buttonAnimation}
      className={`
        ${baseClasses}
        ${!isLoading && !disabled ? variants[variant] : ''}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && (
          <m.div
            variants={spinnerAnimation}
            animate="animate"
            className="flex items-center justify-center"
          >
            <svg
              className="w-4 h-4"
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
        
        <span className="flex items-center gap-2">
          {isLoading && loadingText ? loadingText : (
            <>
              {icon && <span>{icon}</span>}
              {children}
            </>
          )}
        </span>
      </div>
    </m.button>
  );
}

export default Button;