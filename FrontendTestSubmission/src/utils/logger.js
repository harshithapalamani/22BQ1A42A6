// Custom Logger for Frontend (using localStorage instead of file system)
export class CustomLogger {
  constructor(context = 'FRONTEND') {
    this.context = context;
    this.logKey = 'url_shortener_logs';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...meta
    };
  }

  writeLog(level, message, meta = {}) {
    const logEntry = this.formatMessage(level, message, meta);
    
    // Get existing logs from localStorage
    const existingLogs = JSON.parse(localStorage.getItem(this.logKey) || '[]');
    
    // Add new log entry
    existingLogs.push(logEntry);
    
    // Keep only last 100 logs to prevent storage overflow
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    // Save back to localStorage
    localStorage.setItem(this.logKey, JSON.stringify(existingLogs));
    
    // Also log to console in development (but avoid console.log as per requirement)
    if (process.env.NODE_ENV === 'development') {
      // Use console methods other than console.log
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info';
      console[consoleMethod](`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`, meta);
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

  // Get all logs
  getLogs() {
    return JSON.parse(localStorage.getItem(this.logKey) || '[]');
  }

  // Clear logs
  clearLogs() {
    localStorage.removeItem(this.logKey);
  }
}
