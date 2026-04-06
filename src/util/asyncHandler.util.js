const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;


//this wrapper function wrapps around the route functions such that you error are handled. 