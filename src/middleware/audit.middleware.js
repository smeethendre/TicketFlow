import morgan from "morgan";
import logger from "../config/logger.js";

// custom morgan token — extracts userId from JWT cookie
morgan.token("userId", (req) => {
  return req.user?._id?.toString() || "unauthenticated";
});

morgan.token("body", (req) => {
  // log body but never log password
  const body = { ...req.body };
  if (body.password) body.password = "[REDACTED]";
  return JSON.stringify(body);
});

// format: METHOD URL STATUS RESPONSE_TIME userId IP
const auditFormat =
  ":method :url :status :response-time ms | user::userId | ip::remote-addr | body::body";

const auditLogger = morgan(auditFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

export { auditLogger };