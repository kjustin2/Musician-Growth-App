// Debug mode check
const DEBUG = import.meta.env.DEV;

/**
 * Debug logger helper
 */
export const debugLog = (module: string, message: string, data: unknown = null): void => {
  if (DEBUG) {
    console.log(`[${module}] ${message}:`, data);
  }
};

/**
 * Info logger - always logs (even in production)
 */
export const infoLog = (module: string, message: string, data: unknown = null): void => {
  console.info(`[${module}] ${message}:`, data);
};

/**
 * Helper function to safely convert unknown error to Error
 */
const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  return new Error('Unknown error occurred');
};

/**
 * Error logger - always logs
 */
export const errorLog = (
  module: string,
  message: string,
  error: unknown,
  data: unknown = null
): void => {
  const errorObj = toError(error);
  console.error(`[${module}] ${message}:`, errorObj);

  if (data) {
    console.error(`[${module}] Additional context:`, data);
  }
};

/**
 * Warning logger - always logs
 */
export const warnLog = (module: string, message: string, data: unknown = null): void => {
  console.warn(`[${module}] ${message}:`, data);
};
