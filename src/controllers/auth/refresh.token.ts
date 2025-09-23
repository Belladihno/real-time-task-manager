import ApiError from "@/utils/apiError";
import Token from "@/models/token.model";
import { generateAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { Types } from "mongoose";
import { Request, Response, NextFunction, CookieOptions } from "express";
import catchAsync from "@/utils/catchAsync";
import config from "@/config/index.config";
import { logger } from "@/lib/winston";

export const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) {
      return next(
        new ApiError("Refresh token not provided. Please login again!", 401)
      );
    }

    const decoded = verifyRefreshToken(refreshToken) as { userId: string };

    const userId = new Types.ObjectId(decoded.userId);

    const tokenExists = await Token.findOne({
      token: refreshToken,
      userId,
    });

    if (!tokenExists) {
      return next(new ApiError("Invalid refresh token", 401));
    }

    const newAccessToken = generateAccessToken(userId);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.cookie("accessToken", newAccessToken, cookieOptions);

    res.status(200).json({
      status: "success",
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });

    logger.info("Access token refreshed successfully", userId);
  }
);
