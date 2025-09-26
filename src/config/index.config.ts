import dotenv from "dotenv";
import ms from "ms";

dotenv.config();

const config = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URL: process.env.MONGO_URL,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
  WHITELIST_ADMINS_MAIL: ["abimbolaomisakin678@gmail.com"],
  defaultResLimit: 10,
  HMAC_SECRET_KEY: process.env.HMAC_VERIFICATION_CODE_SECRET
};

export default config;
