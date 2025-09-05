import pino from 'pino'
import { isProduction, isDevelopment } from './env'

// Create logger configuration
const loggerConfig = {
  level: isProduction ? 'info' : 'debug',
  formatters: {
    level: (label: string) => {
      return { level: label }
    },
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
}

// Create the logger instance (use pino-pretty transport in development)
const baseConfig: pino.LoggerOptions = { ...loggerConfig } as any

if (isDevelopment) {
  ;(baseConfig as any).transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  }
}

export const logger = pino(baseConfig)

// Helper functions for different log levels
export const log = {
  info: (message: string, meta?: any) => logger.info(meta, message),
  warn: (message: string, meta?: any) => logger.warn(meta, message),
  error: (message: string, error?: Error | any, meta?: any) => {
    const logData = { ...meta }
    if (error) {
      logData.error = error.message || error
      logData.stack = error.stack
    }
    logger.error(logData, message)
  },
  debug: (message: string, meta?: any) => logger.debug(meta, message),
  trace: (message: string, meta?: any) => logger.trace(meta, message),
}

// Request logging middleware helper
export const logRequest = (req: Request, res?: Response, responseTime?: number) => {
  const method = req.method
  const url = new URL(req.url).pathname
  
  const logData: Record<string, any> = {
    method,
    url,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
  }
  
  if (responseTime) {
    logData.responseTime = `${responseTime}ms`
  }
  
  logger.info(logData, `${method} ${url}`)
}

// Performance logging helper
export const logPerformance = (operation: string, startTime: number, metadata?: any) => {
  const duration = Date.now() - startTime
  logger.info({ operation, duration, ...metadata }, `Performance: ${operation}`)
}

// Error logging helper with context
export const logError = (error: Error, context?: string, metadata?: any) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    context,
    ...metadata
  }, `Error${context ? ` in ${context}` : ''}: ${error.message}`)
}

// Database operation logging
export const logDatabase = (operation: string, table: string, duration?: number, metadata?: any) => {
  const logData = { operation, table, ...metadata }
  if (duration) {
    logData.duration = `${duration}ms`
  }
  logger.debug(logData, `Database: ${operation} on ${table}`)
}

// API call logging
export const logApiCall = (service: string, endpoint: string, method: string, statusCode?: number, duration?: number, metadata?: any) => {
  const logData = { service, endpoint, method, ...metadata }
  if (statusCode) logData.statusCode = statusCode
  if (duration) logData.duration = `${duration}ms`
  
  const level = statusCode && statusCode >= 400 ? 'warn' : 'info'
  logger[level](logData, `API Call: ${method} ${service}/${endpoint}`)
}

export default logger
