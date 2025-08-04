// Utility function to safely extract error message
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
