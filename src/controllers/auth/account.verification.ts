import User from "@/models/user";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import { logger } from "@/lib/winston";
import { generateToken } from "@/helpers/generateToken";
import { hashToken } from "@/utils/hashing";
import emailService from "@/services/email.service";

export const accountVerification = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return next(new ApiError("user does not exist", 404));
    }

    if (user.isVerified) {
      return next(new ApiError("Account already verified!", 409));
    }

    const verificationToken = generateToken();

    const hashedVerificationToken = hashToken(verificationToken);

    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const verificationURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verify-account/${verificationToken}`;

    try {
      await emailService.sendEmail({
        to: user.email,
        subject: "Account Verification",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Account Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Verify Your Email Address</h2>
                <p>Hello,</p>
                <p>Thank you for signing up! Please verify your email address to complete your account setup. Click the button below to verify your email:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationURL}" 
                       style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                    ${verificationURL}
                </p>
                
                <p style="color: #dc3545; font-weight: bold;">
                    This link will expire in 10 minutes for security reasons.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    This email was sent by Task Manager<br>
                    If you're having trouble clicking the button, copy and paste the URL above into your web browser.
                </p>
            </div>
        </body>
        </html>`,
        text: `
Account Verification

Thank you for signing up! Please verify your email address to complete your account setup.

Verify your email by visiting this link:
${verificationURL}

This link will expire in 10 minutes.
        `,
      });
      logger.info("Verification link sent to:", user.email);
      res.status(200).json({
        status: "success",
        message: "Verification link sent to your email",
      });
    } catch (emailError) {
      user.verificationToken = null;
      user.verificationTokenExpiresAt = null;
      await user.save();

      logger.error("Email sending failed:", emailError);
      return next(
        new ApiError(
          "Unable to send verification email. Please try again later.",
          503
        )
      );
    }
  }
);
