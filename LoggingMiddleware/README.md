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
<<<<<<< HEAD
const CustomLogger = require("./index");

const logger = new CustomLogger({
  logLevel: "info",
  logFile: "./logs/app.log",
  enableConsole: false, // Set to true only for development
=======
const CustomLogger = require('./index');

const logger = new CustomLogger({
  logLevel: 'info',
  logFile: './logs/app.log',
  enableConsole: false // Set to true only for development
>>>>>>> 23a406f5b4a04b91567ebabe8b561535bdc700ea
});

// Use as Express middleware
app.use(logger.expressMiddleware());

// Manual logging
<<<<<<< HEAD
logger.info("Application started");
logger.error("An error occurred", { error: err.message });
=======
logger.info('Application started');
logger.error('An error occurred', { error: err.message });
>>>>>>> 23a406f5b4a04b91567ebabe8b561535bdc700ea
```

## Installation

```bash
npm install
```
