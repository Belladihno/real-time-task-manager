import User from "@/models/user";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import { logger } from "@/lib/winston";
import { IUser } from "@/@types/interface";
import { generateToken } from "@/helpers/generate.token";
import emailService from "@/services/email.service";
import { hashToken } from "@/utils/hashing";

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
      await emailService.sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your account. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                    ${resetURL}
                </p>
                
                <p style="color: #dc3545; font-weight: bold;">
                    This link will expire in 10 minutes for security reasons.
                </p>
                
                <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    This email was sent by Task Manager<br>
                    If you're having trouble clicking the button, copy and paste the URL above into your web browser.
                </p>
            </div>
        </body>
        </html>`,
        text: `
Password Reset Request

You requested a password reset for your account.

Reset your password by visiting this link:
${resetURL}

This link will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.
        `,
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
