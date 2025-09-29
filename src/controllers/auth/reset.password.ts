import User from "@/models/user";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import { doHash, hashToken } from "@/utils/hashing";
import { logger } from "@/lib/winston";

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return next(new ApiError("No token provided", 400));
    }

    const { error } = validator.resetPasswordSchema.validate({
      password,
      confirmPassword,
    });

    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const hashedLinkToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedLinkToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("Invalid or expired token", 400));
    }

    const hashedPassword = await doHash(password, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    user.passwordChangedAt = new Date();

    await user.save();

    logger.info("Password reset successful for user:", user.email);

    res.status(200).json({
      status: "success",
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  }
);
