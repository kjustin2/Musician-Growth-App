export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  component?: string;
  data?: any;
  error?: Error;
}

class LoggingService {
  private logLevel: LogLevel = 'info';
  private isDevelopment = import.meta.env.DEV;

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, component?: string): string {
    const timestamp = new Date().toISOString();
    const componentStr = component ? `[${component}]` : '';
    return `${timestamp} [${level.toUpperCase()}] ${componentStr} ${message}`;
  }

  private logToConsole(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message);
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, data);
        }
        break;
      case 'info':
        console.info(formattedMessage, data);
        break;
      case 'warn':
        console.warn(formattedMessage, data);
        break;
      case 'error':
        console.error(formattedMessage, error || data);
        if (error && this.isDevelopment) {
          console.error('Stack trace:', error.stack);
        }
        break;
    }
  }

  debug(message: string, data?: any, component?: string): void {
    this.logToConsole('debug', message, data);
  }

  info(message: string, data?: any, component?: string): void {
    this.logToConsole('info', message, data);
  }

  warn(message: string, data?: any, component?: string): void {
    this.logToConsole('warn', message, data);
  }

  error(message: string, error?: Error, data?: any, component?: string): void {
    this.logToConsole('error', message, data, error);
  }

  // Convenience methods for component logging
  componentLog(component: string, level: LogLevel, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message, component);
    this.logToConsole(level, formattedMessage, data);
  }

  // Method for logging state changes
  stateChange(component: string, action: string, before?: any, after?: any): void {
    if (this.isDevelopment) {
      this.debug(`State change: ${action}`, { before, after }, component);
    }
  }

  // Method for logging API calls or service operations
  serviceCall(service: string, operation: string, params?: any, result?: any, error?: Error): void {
    if (error) {
      this.error(`${service}.${operation} failed`, error, params);
    } else {
      this.info(`${service}.${operation} completed`, { params, result });
    }
  }
}

// Create and export a singleton instance
export const loggingService = new LoggingService();

// Set log level based on environment
if (import.meta.env.DEV) {
  loggingService.setLogLevel('debug');
} else {
  loggingService.setLogLevel('warn');
}

export default loggingService;