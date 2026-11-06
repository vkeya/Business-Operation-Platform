
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

const contactRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "smatpic:contact",
  analytics: false,
});

export async function checkContactRateLimit(identifier: string) {
  return contactRateLimiter.limit(identifier);
}
