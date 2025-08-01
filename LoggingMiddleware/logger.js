const fs = require('fs');
const path = require('path');

class CustomLogger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logFile = options.logFile || path.join(__dirname, 'logs', 'app.log');
    this.enableConsole = options.enableConsole || false;
    
    // Ensure logs directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeLog(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Write to file
    fs.appendFileSync(this.logFile, formattedMessage);
    
    // Optionally write to console (only for development)
    if (this.enableConsole) {
      console.log(formattedMessage.trim());
    }
  }

  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }

  // Express middleware function
  expressMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      // Capture response
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip
        });
      });

      next();
    };
  }
}

module.exports = CustomLogger;
