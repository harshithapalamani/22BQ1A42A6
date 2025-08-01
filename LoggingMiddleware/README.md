# Custom Logging Middleware

A custom logging middleware for Express.js applications that provides structured logging without using console.log or built-in loggers.

## Features

- Evaluation server integration
- Structured JSON log format
- Express middleware integration
- Request/Response logging
- Multiple log levels (info, error, warn, debug)
- Environment variable support for tokens

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file and add your evaluation token:
```bash
EVALUATION_TOKEN=your_actual_token_here
```

## Usage

```javascript
const Log = require('./index');
const { CustomLogger } = require('./index');

// Direct logging function
await Log('backend', 'info', 'service', 'Application started');

// Using CustomLogger class
const logger = new CustomLogger({
  enableConsole: false // Set to true only for development
});

// Use as Express middleware
app.use(logger.expressMiddleware());

// Manual logging
logger.info('Application started');
logger.error('An error occurred', { package: 'handler' });
```

## Environment Variables

- `EVALUATION_TOKEN`: Bearer token for evaluation server authentication
