import User from "@/models/user";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import { logger } from "@/lib/winston";
import { generateToken } from "@/helpers/generate.token";
import { hashToken } from "@/utils/hashing";
import emailService from "@/services/email.service";
import { verificationEmail } from "@/services/email.template";

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
      const emailContent = verificationEmail(verificationURL);

      await emailService.sendEmail({
        to: user.email,
        subject: "Account Verification",
        html: emailContent.html,
        text: emailContent.text,
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
