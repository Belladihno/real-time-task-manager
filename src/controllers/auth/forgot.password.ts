import User from "@/models/user";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import { logger } from "@/lib/winston";
import { IUser } from "@/@types/interface";
import { generateToken } from "@/helpers/generate.token";
import emailService from "@/services/email.service";
import { hashToken } from "@/utils/hashing";
import { passwordResetEmail } from "@/services/email.template";

type UserData = Pick<IUser, "email">;

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email }: UserData = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new ApiError("user does not exist", 404));
    }

    const resetToken = generateToken();

    const hashedResetToken = hashToken(resetToken);

    existingUser.resetPasswordToken = hashedResetToken;
    existingUser.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await existingUser.save();

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password/${resetToken}`;

    try {
      const emailContent = passwordResetEmail(resetURL);

      await emailService.sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: emailContent.html,
        text: emailContent.text,
      });

      logger.info("Password reset link sent to:", existingUser.email);

      res.status(200).json({
        status: "success",
        message: "Password reset link sent to your email",
      });
    } catch (emailError) {
      existingUser.resetPasswordToken = null;
      existingUser.resetPasswordExpiresAt = null;
      await existingUser.save();

      logger.error("Email sending failed:", emailError);
      return next(
        new ApiError("Unable to send reset email. Please try again later.", 503)
      );
    }
  }
);
