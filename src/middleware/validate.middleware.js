import { ApiError } from "../util/apiError.util.js";

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = result.error.errors[0].message;
      return next(new ApiError(400, errorMessage));
    }
    req.body = result.data;
    next();
  };
};

export { validate };