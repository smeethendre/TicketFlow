import winston from "winston";
import path from "path";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    // logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // logs to file — all requests
    new winston.transports.File({
      filename: "logs/audit.log",
    }),
    // logs errors separately
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});

export default logger;
