import { motion, AnimatePresence } from 'framer-motion';
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
      color: '#6B7280'
    },
    focused: { 
      y: -24, 
      scale: 0.85, 
      color: '#2563EB',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
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
      px-4
      py-2
      rounded-lg
      border-2
      outline-none
      transition-all
      duration-200
      bg-white
      ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
    `;

    if (error) {
      return `${baseStyles} border-red-500 focus:border-red-600 text-red-600`;
    }
    if (success) {
      return `${baseStyles} border-green-500 focus:border-green-600 text-green-600`;
    }
    if (isFocused) {
      return `${baseStyles} border-blue-500 focus:border-blue-600`;
    }
    return `${baseStyles} border-gray-300 focus:border-blue-500`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="default"
      animate={isHovered ? "hover" : "default"}
      className="relative mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label */}
      <motion.label
        variants={labelVariants}
        initial="default"
        animate={isFocused || value ? "focused" : "default"}
        className="absolute left-4 cursor-text"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input container */}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${getInputStyles()}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Success icon */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error/Helper text */}
      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}
          >
            {error || helperText}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Input; 