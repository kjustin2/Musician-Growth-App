import { loggingService } from '../services/loggingService';

/**
 * Safe property access with optional chaining and fallback values
 */
export class SafeAccess {
  /**
   * Safely access a nested property with a fallback value
   */
  static get<T>(
    obj: any,
    path: string | string[],
    fallback: T
  ): T {
    try {
      const keys = Array.isArray(path) ? path : path.split('.');
      let current = obj;
      
      for (const key of keys) {
        if (current == null || typeof current !== 'object') {
          return fallback;
        }
        current = current[key];
      }
      
      return current !== undefined && current !== null ? current : fallback;
    } catch (error) {
      loggingService.debug('Safe access failed', { path, error });
      return fallback;
    }
  }

  /**
   * Safely access an array element with bounds checking
   */
  static arrayGet<T>(
    arr: T[] | null | undefined,
    index: number,
    fallback: T
  ): T {
    try {
      if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
        return fallback;
      }
      const value = arr[index];
      return value !== undefined && value !== null ? value : fallback;
    } catch (error) {
      loggingService.debug('Safe array access failed', { index, error });
      return fallback;
    }
  }

  /**
   * Safely get the length of an array or string
   */
  static length(value: any[] | string | null | undefined): number {
    try {
      if (Array.isArray(value) || typeof value === 'string') {
        return value.length;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Safely check if an array or string is empty
   */
  static isEmpty(value: any[] | string | null | undefined): boolean {
    return SafeAccess.length(value) === 0;
  }

  /**
   * Safely get the first element of an array
   */
  static first<T>(arr: T[] | null | undefined, fallback: T): T {
    return SafeAccess.arrayGet(arr, 0, fallback);
  }

  /**
   * Safely get the last element of an array
   */
  static last<T>(arr: T[] | null | undefined, fallback: T): T {
    if (!Array.isArray(arr) || arr.length === 0) {
      return fallback;
    }
    return SafeAccess.arrayGet(arr, arr.length - 1, fallback);
  }

  /**
   * Safely slice an array
   */
  static slice<T>(
    arr: T[] | null | undefined,
    start: number = 0,
    end?: number
  ): T[] {
    try {
      if (!Array.isArray(arr)) {
        return [];
      }
      return arr.slice(start, end);
    } catch {
      return [];
    }
  }

  /**
   * Safely filter an array with error handling
   */
  static filter<T>(
    arr: T[] | null | undefined,
    predicate: (item: T, index: number) => boolean
  ): T[] {
    try {
      if (!Array.isArray(arr)) {
        return [];
      }
      return arr.filter((item, index) => {
        try {
          return predicate(item, index);
        } catch (error) {
          loggingService.debug('Filter predicate failed', { item, index, error });
          return false;
        }
      });
    } catch {
      return [];
    }
  }

  /**
   * Safely map an array with error handling
   */
  static map<T, U>(
    arr: T[] | null | undefined,
    mapper: (item: T, index: number) => U,
    fallback: U[] = []
  ): U[] {
    try {
      if (!Array.isArray(arr)) {
        return fallback;
      }
      return arr.map((item, index) => {
        try {
          return mapper(item, index);
        } catch (error) {
          loggingService.debug('Map function failed', { item, index, error });
          throw error; // Re-throw to be caught by outer try-catch
        }
      });
    } catch {
      return fallback;
    }
  }

  /**
   * Safely reduce an array with error handling
   */
  static reduce<T, U>(
    arr: T[] | null | undefined,
    reducer: (acc: U, item: T, index: number) => U,
    initialValue: U
  ): U {
    try {
      if (!Array.isArray(arr)) {
        return initialValue;
      }
      return arr.reduce((acc, item, index) => {
        try {
          return reducer(acc, item, index);
        } catch (error) {
          loggingService.debug('Reduce function failed', { item, index, error });
          return acc; // Return accumulator unchanged on error
        }
      }, initialValue);
    } catch {
      return initialValue;
    }
  }

  /**
   * Safely find an element in an array
   */
  static find<T>(
    arr: T[] | null | undefined,
    predicate: (item: T, index: number) => boolean,
    fallback?: T
  ): T | undefined {
    try {
      if (!Array.isArray(arr)) {
        return fallback;
      }
      const found = arr.find((item, index) => {
        try {
          return predicate(item, index);
        } catch (error) {
          loggingService.debug('Find predicate failed', { item, index, error });
          return false;
        }
      });
      return found !== undefined ? found : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Safely sort an array with error handling
   */
  static sort<T>(
    arr: T[] | null | undefined,
    compareFn?: (a: T, b: T) => number
  ): T[] {
    try {
      if (!Array.isArray(arr)) {
        return [];
      }
      const copy = [...arr];
      if (compareFn) {
        return copy.sort((a, b) => {
          try {
            return compareFn(a, b);
          } catch (error) {
            loggingService.debug('Sort compare function failed', { a, b, error });
            return 0; // Treat as equal on error
          }
        });
      }
      return copy.sort();
    } catch {
      return [];
    }
  }

  /**
   * Safely convert a value to string
   */
  static toString(value: any, fallback: string = ''): string {
    try {
      if (value === null || value === undefined) {
        return fallback;
      }
      return String(value);
    } catch {
      return fallback;
    }
  }

  /**
   * Safely convert a value to number
   */
  static toNumber(value: any, fallback: number = 0): number {
    try {
      if (value === null || value === undefined) {
        return fallback;
      }
      const num = Number(value);
      return isNaN(num) ? fallback : num;
    } catch {
      return fallback;
    }
  }

  /**
   * Safely convert a value to boolean
   */
  static toBoolean(value: any, fallback: boolean = false): boolean {
    try {
      if (value === null || value === undefined) {
        return fallback;
      }
      return Boolean(value);
    } catch {
      return fallback;
    }
  }

  /**
   * Safely parse a date
   */
  static toDate(value: any, fallback: Date = new Date()): Date {
    try {
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? fallback : value;
      }
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? fallback : date;
      }
      return fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Safely execute a function with error handling
   */
  static execute<T>(
    fn: () => T,
    fallback: T,
    errorMessage?: string
  ): T {
    try {
      return fn();
    } catch (error) {
      if (errorMessage) {
        loggingService.debug(errorMessage, { error });
      }
      return fallback;
    }
  }

  /**
   * Safely execute an async function with error handling
   */
  static async executeAsync<T>(
    fn: () => Promise<T>,
    fallback: T,
    errorMessage?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (errorMessage) {
        loggingService.debug(errorMessage, { error });
      }
      return fallback;
    }
  }
}