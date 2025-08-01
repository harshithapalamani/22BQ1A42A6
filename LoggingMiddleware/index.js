const fetch = require('node-fetch');

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
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMmJxMWE0MmE2QHZ2aXQubmV0IiwiZXhwIjoxNzU0MDMwNjI5LCJpYXQiOjE3NTQwMjk3MjksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIzNWY2MjAxNi1hNTBjLTRlMmUtOTUzNi0yMTY3MzM5Yjg3MmYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJwYWxhbWFuaSBzcmkgaGFyc2hpdGhhIiwic3ViIjoiMWJmODQyNTktOWRjMC00MjRkLTk3ODgtNjcwNzUxMWUyODI5In0sImVtYWlsIjoiMjJicTFhNDJhNkB2dml0Lm5ldCIsIm5hbWUiOiJwYWxhbWFuaSBzcmkgaGFyc2hpdGhhIiwicm9sbE5vIjoiMjJicTFhNDJhNiIsImFjY2Vzc0NvZGUiOiJQblZCRlYiLCJjbGllbnRJRCI6IjFiZjg0MjU5LTlkYzAtNDI0ZC05Nzg4LTY3MDc1MTFlMjgyOSIsImNsaWVudFNlY3JldCI6IndnZENXQWZ6cHdCQWdGWVoifQ.GbONWiiz5JafkQ-ag6K3c8Y0V44CHR5vk5H4W9Tl1cE'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Fallback logging (but avoid console.log as per requirements)
      // Using console.error only for critical logging failures
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
