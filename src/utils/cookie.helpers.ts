import { CookieOptions, Response } from "express";
import config from "@/config/index.config";
import ms from "ms";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: ms(config.ACCESS_TOKEN_EXPIRY),
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: ms(config.REFRESH_TOKEN_EXPIRY),
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};
