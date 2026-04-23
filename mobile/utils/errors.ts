import { TRPCClientError } from '@trpc/client';

export const formatError = (error: any): string => {
  if (error instanceof TRPCClientError) {
    try {
      const data = JSON.parse(error.message);
      if (Array.isArray(data)) {
        // Handle Zod validation errors
        return data.map(err => {
          if (err.path?.includes('email')) {
            return 'Invalid email format. Example: user@example.com';
          }
          if (err.path?.includes('password')) {
            return err.message || 'Invalid password.';
          }
          return err.message;
        }).join('\n');
      }
    } catch (e) {
      // Not JSON, fall back to message
    }
    return error.message;
  }
  return typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
};
