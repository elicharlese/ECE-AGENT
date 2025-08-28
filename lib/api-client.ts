/**
 * Enhanced API client with retry logic, error handling, and loading states
 */

export interface ApiResponse<T> {
  data?: T
  error?: string
  loading: boolean
}

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof ApiError && error.status) {
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error
        }
      }

      if (attempt === opts.maxRetries) {
        break
      }

      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      )
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<T> {
  return withRetry(async () => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Ignore JSON parsing errors for error responses
      }

      throw new ApiError(errorMessage, response.status)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    
    return response.text() as T
  }, retryOptions)
}

// React hook for API calls with loading states
export function useApiCall<T>() {
  const [state, setState] = React.useState<ApiResponse<T>>({
    loading: false,
  })

  const execute = React.useCallback(async (
    operation: () => Promise<T>
  ): Promise<T | undefined> => {
    setState({ loading: true })
    
    try {
      const data = await operation()
      setState({ data, loading: false })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState({ error: errorMessage, loading: false })
      throw error
    }
  }, [])

  const reset = React.useCallback(() => {
    setState({ loading: false })
  }, [])

  return { ...state, execute, reset }
}

// Import React for the hook
import React from "react"
