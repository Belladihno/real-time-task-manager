import { logger } from "@/lib/winston";
import User from "@/models/user.model";
import ApiError from "@/utils/apiError";
import catchAsync from "@/utils/catchAsync";
import type { Request, Response, NextFunction } from "express";

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;

    const user = await User.findById(userId).select("-__v").lean().exec();

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    res.status(200).json({
      Profile: user,
    });

    logger.info("User fetched successfully", user);
  }
);
