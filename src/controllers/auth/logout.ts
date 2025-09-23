import type { CookieOptions, NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import { logger } from "@/lib/winston";
import Token from "@/models/token.model";
import config from "@/config/index.config";
import { verifyAccessToken } from "@/lib/jwt";
import BlacklistToken from "@/models/blacklist.token.model";

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string;
    const accessToken = req.cookies.accessToken as string;

    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });
      logger.info("User refresh token deleted successfully", {
        userId: req.userId,
        token: refreshToken,
      });
    }

    if (accessToken) {
      const decoded = verifyAccessToken(accessToken) as any;
      await BlacklistToken.create({
        token: accessToken,
        expiresAt: new Date(decoded.exp * 1000),
      });
      logger.info("Access token blacklisted during logout");
    }

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);

    res.sendStatus(204);

    logger.info("User logged out successfully");
  }
);
