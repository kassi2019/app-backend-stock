// src/common/logger/logger.config.ts
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

const baseLogPath = path.join(process.cwd(), 'logs'); // logs/ à la racine
if (!fs.existsSync(baseLogPath)) fs.mkdirSync(baseLogPath, { recursive: true });

const logFormat = winston.format.printf(
  ({ timestamp, level, message, context }) => {
    return `${timestamp} [${level}]${context ? ` [${context}]` : ''}: ${message}`;
  },
);

export function createLogger(moduleName: string) {
  const moduleLogPath = path.join(baseLogPath, moduleName);
  if (!fs.existsSync(moduleLogPath)) fs.mkdirSync(moduleLogPath, { recursive: true });

  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat,
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          logFormat,
        ),
      }),
      new winston.transports.DailyRotateFile({
        filename: path.join(moduleLogPath, '%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  });
}
