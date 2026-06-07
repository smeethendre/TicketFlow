import { createClient } from "redis";
import { ApiError } from "../util/apiError.util.js";

let client;
let connectPromise;

const getClient = () => {
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  client.on("connect", () => console.log("Redis connected"));
  client.on("error", (err) => console.error("Redis error:", err.message));

  return client;
};

const connectRedis = async () => {
  const redisClient = getClient();

  if (redisClient.isOpen) return redisClient;

  connectPromise ??= redisClient.connect().catch((error) => {
    connectPromise = undefined;
    throw error;
  });

  return connectPromise;
};

const redisClient = {
  async get(key) {
    const redis = await connectRedis();
    return redis.get(key);
  },
  async setEx(key, seconds, value) {
    const redis = await connectRedis();
    return redis.setEx(key, seconds, value);
  },
  async del(keys) {
    const redis = await connectRedis();
    return redis.del(keys);
  },
  async keys(pattern) {
    const redis = await connectRedis();
    return redis.keys(pattern);
  },
  async requireConnection() {
    try {
      return await connectRedis();
    } catch (error) {
      throw new ApiError(503, "Redis is required for seat holds but is not reachable");
    }
  },
};

export default redisClient;
