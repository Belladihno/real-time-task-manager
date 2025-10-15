import User from "@/models/user";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import { hashToken } from "@/utils/hashing";
import { logger } from "@/lib/winston";
import { welcomeEmail } from "@/services/email.template";
import emailService from "@/services/email.service";

export const verifyAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.params;

    if (!token) {
      return next(new ApiError("No token provided", 400));
    }

    const hashedLinkToken = hashToken(token);

    const user = await User.findOne({
      verificationToken: hashedLinkToken,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("Invalid or expired token", 400));
    }

    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    user.isVerified = true;
    user.status = "active";

    await user.save();

    try {
      const emailContent = welcomeEmail(user.displayName);

      await emailService.sendEmail({
        to: user.email,
        subject: "Welcome on board",
        html: emailContent.html,
        text: emailContent.text,
      });

      logger.info("Account verified successfully for user:", {
        user: user._id,
      });

      res.status(200).json({
        status: "success",
        message: "Account verified successfully.",
      });
    } catch (emailError) {
      logger.error("Email sending failed:", emailError);
      return next(
        new ApiError(
          "Unable to send welcome email. Please try again later.",
          503
        )
      );
    }
  }
);
