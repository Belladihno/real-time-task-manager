import User from "@/models/user";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import { hashToken } from "@/utils/hashing";

export const verifyToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.params;

    if (!token) {
      return next(new ApiError("Reset token is required", 400));
    }

    const hashedLinkToken = hashToken(token);

    const user = await User.findOne({
      verificationToken: hashedLinkToken,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("Invalid or expired token", 400));
    }

    res.status(200).json({
      status: "success",
      message: "Token is valid",
      data: {
        email: user.email,
      },
    });
  }
);
