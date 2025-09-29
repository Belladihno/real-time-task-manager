import { Request, Response, NextFunction } from "express";
import { logger } from "@/lib/winston";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import User from "@/models/user";
import { verifyAccessToken } from "@/lib/jwt";
import { Types } from "mongoose";
import { IUser, IJWTPayload } from "@/utils/interface";
import BlacklistToken from "@/models/blacklist.token";

const extractToken = (req: Request): string | null => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
};

const verifyToken = (token: string): IJWTPayload => {
  const decoded = verifyAccessToken(token);
  if (typeof decoded !== "object" || !decoded || !decoded.userId) {
    logger.warn("Invalid token format", { token });
    throw new ApiError("Invalid token format", 401);
  }

  return decoded as IJWTPayload;
};

const checkPasswordChanged = (user: IUser, tokenIssuedAt: number): boolean => {
  if (!user.passwordChangedAt) {
    return false;
  }

  const passwordChangedTimestamp = Math.floor(
    user.passwordChangedAt.getTime() / 1000
  );
  return passwordChangedTimestamp > tokenIssuedAt;
};

const validateUser = async (
  userId: string,
  tokenIssuedAt: number
): Promise<IUser> => {
  if (!Types.ObjectId.isValid(userId)) {
    logger.warn("Invalid user ID format", { userId });
    throw new ApiError("Invalid user ID format", 401);
  }

  const user = await User.findById(userId).select("+isActive");

  if (!user) {
    logger.warn("User not found", { userId });
    throw new ApiError("User account no longer exists", 401);
  }

  if (!user.isActive) {
    logger.warn("Inactive user attempted access", {
      userId: user._id,
      email: user.email,
    });

    throw new ApiError("Account is deactivated. Contact support", 401);
  }

  if (checkPasswordChanged(user, tokenIssuedAt)) {
    logger.warn("Password recently changed", { userId });
    throw new ApiError(
      "User recently changed password. Please log in again.",
      401
    );
  }

  return user as IUser;
};

const isBlacklist = async (token: string): Promise<void> => {
  const blacklistedToken = await BlacklistToken.findOne({ token });
  if (blacklistedToken) {
    logger.warn("Attempt to use blacklisted token", {
      tokenId: blacklistedToken._id,
      blacklistedAt: blacklistedToken.createdAt,
    });
    throw new ApiError("Token has been blacklisted. Please login again!", 401);
  }
};

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = extractToken(req);
    if (!token) {
      logger.warn("Access attempt without access token", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return next(
        new ApiError("You are not logged in! Please log in to get access.", 401)
      );
    }

    await isBlacklist(token);

    const decoded = verifyToken(token);

    const currentUser = await validateUser(decoded.userId, decoded.iat || 0);

    req.userId = new Types.ObjectId(decoded.userId);
    req.user = currentUser;

    logger.info("User authenticated successfully", {
      userId: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
    });

    next();
  }
);

export default protect;
