import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const toastVariants = {
  initial: { 
    opacity: 0,
    y: 50,
    scale: 0.3,
    filter: "blur(10px)"
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.5,
    filter: "blur(10px)",
    transition: {
      duration: 0.2
    }
  }
};

const progressVariants = {
  initial: { 
    scaleX: 1
  },
  animate: { 
    scaleX: 0,
    transition: {
      duration: 5,
      ease: "linear"
    }
  }
};

const Toast = ({ 
  message, 
  type = 'success', 
  onClose,
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    const baseStyles = 'rounded-lg shadow-lg p-4 flex items-start space-x-3 min-w-[320px] backdrop-blur-sm';
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 border border-green-200`;
      case 'error':
        return `${baseStyles} bg-red-50/90 border border-red-200`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 border border-yellow-200`;
      case 'info':
        return `${baseStyles} bg-blue-50/90 border border-blue-200`;
      default:
        return baseStyles;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={getStyles()}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {message}
            </p>
          </div>

          {/* Close button */}
          <m.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </m.button>

          {/* Progress bar */}
          <m.div
            variants={progressVariants}
            initial="initial"
            animate="animate"
            className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20"
            style={{
              originX: 0
            }}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [] }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast; 