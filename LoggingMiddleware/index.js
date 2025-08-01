const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Custom Logging Middleware for Assignment
 * Sends logs to the evaluation server as required
 * 
 * @param {string} stack - "backend" or "frontend"
 * @param {string} level - "debug", "info", "warn", "error", "fatal"
 * @param {string} packageName - "cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"
 * @param {string} message - The log message
 */
async function Log(stack, level, packageName, message) {
  try {
    const payload = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message,
      timestamp: new Date().toISOString()
    };

    const response = await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EVALUATION_TOKEN || 'YOUR_TOKEN_HERE'}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to log:', await response.text());
    }
  } catch (err) {
    console.error('Log middleware error:', err.message);
  }
}

// Additional helper class for Express middleware integration
class CustomLogger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.enableConsole = options.enableConsole || false;
  }

  async info(message, meta = {}) {
    await Log('backend', 'info', meta.package || 'service', message);
  }

  async error(message, meta = {}) {
    await Log('backend', 'error', meta.package || 'handler', message);
  }

  async warn(message, meta = {}) {
    await Log('backend', 'warn', meta.package || 'service', message);
  }

  async debug(message, meta = {}) {
    await Log('backend', 'debug', meta.package || 'service', message);
  }

  async fatal(message, meta = {}) {
    await Log('backend', 'fatal', meta.package || 'handler', message);
  }

  // Express middleware function
  expressMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.info('Incoming request', {
        package: 'route',
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Capture response
      res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'error' : 'info';
        const packageName = res.statusCode >= 500 ? 'handler' : 'route';
        
        this[level]('Request completed', {
          package: packageName,
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

// Export both the main Log function and the helper class
module.exports = Log;
module.exports.CustomLogger = CustomLogger;
