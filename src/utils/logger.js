/**
 * Logger Utility
 * 
 * Professional logging utility for the application. 
 * - Formats logs consistently
 * - Supports different log levels (info, warn, error, etc.)
 * - Includes timestamps
 * - Can be disabled in production
 * - Has conditional logging based on environment
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Default logging settings
const config = {
  enabled: isDevelopment || isTest,
  level: 'info', // 'debug', 'info', 'warn', 'error'
  prefix: '🛍️ SHOP',
  groupCollapsed: true
};

// Log levels with their respective emoji and priorities
const LOG_LEVELS = {
  debug: { priority: 0, emoji: '🔍', color: '#808080', method: 'debug' },
  info: { priority: 1, emoji: 'ℹ️', color: '#0066ff', method: 'info' },
  warn: { priority: 2, emoji: '⚠️', color: '#FFA500', method: 'warn' },
  error: { priority: 3, emoji: '❌', color: '#FF0000', method: 'error' },
  critical: { priority: 4, emoji: '🔥', color: '#8B0000', method: 'error' }
};

/**
 * Formats a log message with timestamp and predefined styling
 * 
 * @param {string} level - Log level (debug, info, warn, error, critical)
 * @param {string} message - The main log message
 * @param {string} [component] - Optional component name
 * @returns {Array} Formatted log parts for console
 */
const formatLog = (level, message, component) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
  const prefix = component ? `${config.prefix} [${component}]` : config.prefix;

  return [
    `%c${timestamp} %c${logLevel.emoji} ${level.toUpperCase()} %c${prefix}%c ${message}`,
    'color: #666; font-weight: normal;', // timestamp style
    `color: ${logLevel.color}; font-weight: bold;`, // level style
    'color: #0066cc; font-weight: bold;', // prefix style
    'color: inherit; font-weight: normal;' // message style
  ];
};

/**
 * Log method factory - creates a log function for a specific level
 * 
 * @param {string} level - The log level to create
 * @returns {Function} Logging function for the specified level
 */
const createLogger = (level) => {
  return (message, data = null, component = null) => {
    if (!config.enabled) return;
    
    const logLevel = LOG_LEVELS[level];
    const configLevel = LOG_LEVELS[config.level];
    
    // Skip if current log level is lower priority than configured minimum
    if (logLevel.priority < configLevel.priority) return;
    
    const logParts = formatLog(level, message, component);
    
    if (data) {
      if (config.groupCollapsed && level !== 'error' && level !== 'critical') {
        console.groupCollapsed(...logParts);
        if (typeof data === 'object') {
          console.dir(data);
        } else {
          console.log(data);
        }
        console.groupEnd();
      } else {
        console[logLevel.method](...logParts);
        if (typeof data === 'object') {
          console.dir(data);
        } else {
          console.log(data);
        }
      }
    } else {
      console[logLevel.method](...logParts);
    }
  };
};

/**
 * Create API logger specially formatted for API requests/responses
 * 
 * @returns {Object} API logger methods
 */
const createApiLogger = () => {
  return {
    request: (url, method, data) => {
      if (!config.enabled) return;
      
      const logParts = formatLog('info', `API Request: ${method} ${url}`, 'API');
      
      if (config.groupCollapsed) {
        console.groupCollapsed(...logParts);
        if (data) console.log('Request Data:', data);
        console.groupEnd();
      } else {
        console.info(...logParts);
        if (data) console.log('Request Data:', data);
      }
    },
    
    response: (url, method, status, data, time) => {
      if (!config.enabled) return;
      
      const level = status >= 400 ? 'error' : 'info';
      const logLevel = LOG_LEVELS[level];
      const logParts = formatLog(level, `API Response: ${method} ${url} (${status}) - ${time}ms`, 'API');
      
      if (config.groupCollapsed && status < 400) {
        console.groupCollapsed(...logParts);
        if (data) console.log('Response Data:', data);
        console.groupEnd();
      } else {
        console[logLevel.method](...logParts);
        if (data) console.log('Response Data:', data);
      }
    },
    
    error: (url, method, error) => {
      if (!config.enabled) return;
      
      const logParts = formatLog('error', `API Error: ${method} ${url}`, 'API');
      console.error(...logParts);
      console.error(error);
    }
  };
};

/**
 * Create Firebase logger specially formatted for Firebase operations
 */
const createFirebaseLogger = () => {
  return {
    read: (path, data = null) => {
      if (!config.enabled) return;
      
      const logParts = formatLog('info', `Firebase Read: ${path}`, 'Firebase');
      
      if (config.groupCollapsed) {
        console.groupCollapsed(...logParts);
        if (data) console.log('Data:', data);
        console.groupEnd();
      } else {
        console.info(...logParts);
        if (data) console.log('Data:', data);
      }
    },
    
    write: (path, operation, data = null) => {
      if (!config.enabled) return;
      
      const logParts = formatLog('info', `Firebase ${operation}: ${path}`, 'Firebase');
      
      if (config.groupCollapsed) {
        console.groupCollapsed(...logParts);
        if (data) console.log('Data:', data);
        console.groupEnd();
      } else {
        console.info(...logParts);
        if (data) console.log('Data:', data);
      }
    },
    
    error: (path, operation, error) => {
      if (!config.enabled) return;
      
      const logParts = formatLog('error', `Firebase Error (${operation}): ${path}`, 'Firebase');
      console.error(...logParts);
      console.error(error);
    }
  };
};

/**
 * Create user action logger for tracking user behaviors
 */
const createUserLogger = () => {
  return {
    action: (action, details = null) => {
      if (!config.enabled) return;
      
      const logParts = formatLog('info', `User Action: ${action}`, 'User');
      
      if (config.groupCollapsed && details) {
        console.groupCollapsed(...logParts);
        console.log('Details:', details);
        console.groupEnd();
      } else {
        console.info(...logParts);
        if (details) console.log('Details:', details);
      }
    }
  };
};

// Create logger methods for each level
const logger = {
  debug: createLogger('debug'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
  critical: createLogger('critical'),
  
  // Specialized loggers
  api: createApiLogger(),
  firebase: createFirebaseLogger(),
  user: createUserLogger(),
  
  // Configuration methods
  configure: (options) => {
    Object.assign(config, options);
  },
  
  disable: () => {
    config.enabled = false;
  },
  
  enable: () => {
    config.enabled = true;
  }
};

export default logger; 