import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Handle API errors
 */
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    const apiError: ApiError = {
      message: data.message || 'An error occurred',
      status,
      code: data.code,
      details: data.details,
    };

    // Show toast notification
    toast.error(apiError.message);

    return apiError;
  } else if (error.request) {
    // Request made but no response
    const apiError: ApiError = {
      message: 'No response from server. Please check your connection.',
      code: 'NO_RESPONSE',
    };

    toast.error(apiError.message);
    return apiError;
  } else {
    // Error in request setup
    const apiError: ApiError = {
      message: error.message || 'An unexpected error occurred',
      code: 'REQUEST_ERROR',
    };

    toast.error(apiError.message);
    return apiError;
  }
};

/**
 * Handle form errors
 */
export const handleFormErrors = (errors: Record<string, string[]>): void => {
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    fieldErrors.forEach((error) => {
      toast.error(`${field}: ${error}`);
    });
  });
};

/**
 * Handle validation errors
 */
export const handleValidationError = (message: string): void => {
  toast.error(message);
};

/**
 * Handle success message
 */
export const handleSuccess = (message: string): void => {
  toast.success(message);
};

/**
 * Handle info message
 */
export const handleInfo = (message: string): void => {
  toast.loading(message);
};

/**
 * Log error
 */
export const logError = (error: any, context?: string): void => {
  const logLevel = (import.meta as any).env?.VITE_LOG_LEVEL;
  if (logLevel === 'debug') {
    console.error(`[${context || 'Error'}]`, error);
  }
};
