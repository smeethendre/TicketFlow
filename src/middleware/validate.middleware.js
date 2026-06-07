import { ApiError } from "../util/apiError.util.js";

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        return next(new ApiError(400, errorMessage));
      }
      req.body = result.data;
      next();
    } catch (err) {
      next(new ApiError(400, "Validation failed"));
    }
  };
};

export { validate };