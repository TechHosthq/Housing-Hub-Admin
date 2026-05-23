export interface ApiErrorResponse {
  StatusCode?: string | number;
  statusCode?: string | number;
  Message?: string;
  message?: string;
  Error?: string[] | string;
  errors?: string[] | string;
  isSuccessful?: boolean;
}

export const resolveApiError = (error: any): string[] => {
  const data = error.response?.data as ApiErrorResponse;

  if (!data) {
    return [error.message || 'An unexpected error occurred'];
  }

  const messages: string[] = [];

  // 1. Check for arrays/strings of errors (errors or Error)
  const errorList = data.errors || data.Error;
  if (errorList) {
    if (Array.isArray(errorList)) {
      errorList.forEach(err => {
        if (typeof err === 'object') {
          messages.push(JSON.stringify(err));
        } else {
          messages.push(String(err));
        }
      });
    } else if (typeof errorList === 'object') {
      messages.push(JSON.stringify(errorList));
    } else {
      messages.push(String(errorList));
    }
  } 
  
  // 2. Check for a single message (message or Message)
  const mainMessage = data.message || data.Message;
  if (messages.length === 0 && mainMessage) {
    messages.push(String(mainMessage));
  }

  // 3. Final fallback
  if (messages.length === 0) {
    messages.push('An unexpected error occurred');
  }

  return messages;
};
