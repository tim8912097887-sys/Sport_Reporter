import { createLogger,format } from "winston";
import { transports } from "winston";

const { combine, timestamp, printf } = format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

export const logger = createLogger({
  levels,  
  level: 'info',
  format: combine(
    timestamp(),
    printf(({ timestamp, level, message }) => {
      return `[${level}] ${timestamp} - ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});