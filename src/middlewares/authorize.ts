import type { Request, Response, NextFunction } from "express";
import User from "@/models/user";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";

export type AuthRole = "admin" | "user";

const authorize = (roles: AuthRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findById(userId).select("role").exec();

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    if (!roles.includes(user.role)) {
      return next(
        new ApiError("You do not have permission to access this resource!", 403)
      );
    }

    next();
  });
};

export default authorize;
