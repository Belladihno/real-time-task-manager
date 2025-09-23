import jwt from "jsonwebtoken";
import config from "@/config/index.config";
import { Types } from "mongoose";

export const generateAccessToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
    subject: "accessApi",
  });
};

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
    subject: "refreshToken",
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};
