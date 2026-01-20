

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.send(error.code || 500).json({
      success: false,
      Message: error.Message,
    });
  }
};

export default asyncHandler;


//this wrapper function wrapps around the route functions such that you error are handled. 