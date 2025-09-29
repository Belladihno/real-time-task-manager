import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import User from "@/models/user";
import ApiError from "@/utils/apiError";

export const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-__v").lean().exec();

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    res.status(200).json({
      user,
    });
  }
);
