import { loadEnvConfig } from "@next/env";

const result = loadEnvConfig(process.cwd());

console.log("cwd:", process.cwd());
console.log("loaded env files:", result.loadedEnvFiles);
console.log(
  "DATABASE_URL configured:",
  Boolean(process.env.DATABASE_URL),
);