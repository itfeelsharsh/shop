import { m, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  className = '',
  required = false,
  disabled = false,
  success = false,
  helperText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants for the label
  const labelVariants = {
    default: { 
      y: 0, 
      scale: 1, 
      color: '#9CA3AF' // gray-400
    },
    focused: { 
      y: -28, 
      scale: 0.8, 
      color: '#111827', // gray-900
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  // Animation variants for the input container
  const containerVariants = {
    default: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      scale: 1.01,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  // Animation variants for error/success messages
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: -10,
      height: 0 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      height: 0 
    }
  };

  const getInputStyles = () => {
    let baseStyles = `
      w-full
      px-5
      py-3
      rounded-xl
      border
      outline-none
      transition-all
      duration-300
      bg-gray-50/50
      backdrop-blur-sm
      placeholder:text-transparent
      ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:bg-white'}
    `;

    if (error) {
      return `${baseStyles} border-red-300 focus:border-red-500 text-red-900 ring-4 ring-red-50`;
    }
    if (success) {
      return `${baseStyles} border-emerald-300 focus:border-emerald-500 text-emerald-900 ring-4 ring-emerald-50`;
    }
    if (isFocused) {
      return `${baseStyles} border-gray-900 ring-4 ring-gray-100 text-gray-900`;
    }
    return `${baseStyles} border-gray-200 text-gray-900 hover:border-gray-300`;
  };

  return (
    <m.div
      variants={containerVariants}
      initial="default"
      animate={isHovered ? "hover" : "default"}
      className={`relative mb-8 ${className}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label */}
      <m.label
        variants={labelVariants}
        initial="default"
        animate={isFocused || value ? "focused" : "default"}
        className="absolute left-5 top-3.5 cursor-text text-sm font-medium pointer-events-none select-none z-10"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </m.label>

      {/* Input container */}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-gray-900' : 'text-gray-400'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder || label}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${getInputStyles()}
            ${Icon ? 'pl-12' : ''}
          `}
          {...props}
        />

        {/* Success icon */}
        <AnimatePresence>
          {success && (
            <m.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error/Helper text */}
      <AnimatePresence>
        {(error || helperText) && (
          <m.div
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}
          >
            {error || helperText}
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

export default Input; 