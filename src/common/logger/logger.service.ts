// src/common/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger } from './logger.config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private loggers: Record<string, ReturnType<typeof createLogger>> = {};

  private getLogger(moduleName: string) {
    if (!this.loggers[moduleName]) {
      this.loggers[moduleName] = createLogger(moduleName);
    }
    return this.loggers[moduleName];
  }

  log(message: string, context: string = 'general') {
    const logger = this.getLogger(context);
    logger.info(message, { context });
  }

  error(message: string, trace?: string, context: string = 'general') {
    const logger = this.getLogger(context);
    logger.error(`${message} - ${trace || ''}`, { context });
  }

  warn(message: string, context: string = 'general') {
    const logger = this.getLogger(context);
    logger.warn(message, { context });
  }

  debug(message: string, context: string = 'general') {
    const logger = this.getLogger(context);
    logger.debug(message, { context });
  }

  verbose(message: string, context: string = 'general') {
    const logger = this.getLogger(context);
    logger.verbose(message, { context });
  }
}
