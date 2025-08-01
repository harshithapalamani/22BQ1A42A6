# Custom Logging Middleware

A custom logging middleware for Express.js applications that provides structured logging without using console.log or built-in loggers.

## Features

- File-based logging
- Structured JSON log format
- Express middleware integration
- Request/Response logging
- Multiple log levels (info, error, warn, debug)

## Usage

```javascript
const CustomLogger = require('./index');

const logger = new CustomLogger({
  logLevel: 'info',
  logFile: './logs/app.log',
  enableConsole: false // Set to true only for development
});

// Use as Express middleware
app.use(logger.expressMiddleware());

// Manual logging
logger.info('Application started');
logger.error('An error occurred', { error: err.message });
```

## Installation

```bash
npm install
```
