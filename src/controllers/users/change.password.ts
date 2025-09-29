import type { Request, Response, NextFunction, CookieOptions } from "express";
import { logger } from "@/lib/winston";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import User from "@/models/user";
import { doHash, doHashValidation } from "@/utils/hashing";
import config from "@/config/index.config";

export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    const { error } = validator.changePasswordSchema.validate({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const validatePassword = await doHashValidation(oldPassword, user.password);

    if (!validatePassword) {
      return next(new ApiError("Invalid credentials", 401));
    }

    if (oldPassword === newPassword) {
      return next(
        new ApiError("New password must be different from old password", 400)
      );
    }

    const hashedNewPassword = await doHash(newPassword, 12);

    user.password = hashedNewPassword;

    user.passwordChangedAt = new Date();

    await user.save()

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);

    res.status(200).json({
      status: "success",
      message:
        "Password changed successfully. Please login again with your new password.",
    });

    logger.info(`Password changed for user ${userId}`, {
      userId,
      timestamp: new Date().toISOString(),
    });
  }
);
