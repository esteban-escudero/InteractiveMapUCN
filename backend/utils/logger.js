/**
 * Utilidad de logging centralizada
 */

const config = require('../config/app');

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = config.server.env === 'production' ? logLevels.INFO : logLevels.DEBUG;

const formatMessage = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    ...data,
  };
};

const logger = {
  error: (message, data) => {
    if (logLevels.ERROR <= currentLogLevel) {
      console.error(JSON.stringify(formatMessage('ERROR', message, data)));
    }
  },

  warn: (message, data) => {
    if (logLevels.WARN <= currentLogLevel) {
      console.warn(JSON.stringify(formatMessage('WARN', message, data)));
    }
  },

  info: (message, data) => {
    if (logLevels.INFO <= currentLogLevel) {
      console.info(JSON.stringify(formatMessage('INFO', message, data)));
    }
  },

  debug: (message, data) => {
    if (logLevels.DEBUG <= currentLogLevel) {
      console.debug(JSON.stringify(formatMessage('DEBUG', message, data)));
    }
  },
};

module.exports = logger;

