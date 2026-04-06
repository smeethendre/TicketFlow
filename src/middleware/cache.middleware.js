import redisClient from "../config/redis.js";

const CACHE_TTL = 60; // seconds

const cacheMiddleware = (key) => {
  return async (req, res, next) => {
    const cacheKey = `${key}_${JSON.stringify(req.query)}_${JSON.stringify(req.params)}`;

    try {
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        return res.status(200).json({
          success: true,
          message: "Fetched from cache",
          data: JSON.parse(cached),
        });
      }
    } catch (err) {
      console.error("Redis get error:", err);
      // if redis fails, just continue to DB
    }

    // intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      if (body.success) {
        try {
          await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(body.data));
        } catch (err) {
          console.error("Redis set error:", err);
        }
      }
      return originalJson(body);
    };

    next();
  };
};

const invalidateCache = async (key) => {
  try {
    const keys = await redisClient.keys(`${key}_*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Redis invalidate error:", err);
  }
};

export { cacheMiddleware, invalidateCache };