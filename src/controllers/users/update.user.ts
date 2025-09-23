import type { Request, Response, NextFunction } from "express";
import { logger } from "@/lib/winston";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import User from "@/models/user.model";
import { IUpdataData } from "@/utils/interface";

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;

    const { firstName, lastName, displayName } = req.body;

    if (!firstName && !lastName && !displayName) {
      return next(
        new ApiError("At least one field is required to update profile", 400)
      );
    }

    const { error } = validator.updateUserSchema.validate({
      firstName,
      lastName,
      displayName,
    });

    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    if (displayName) {
      const existingdisplayName = await User.findOne({
        displayName: { $regex: new RegExp(`^${displayName}$`, "i") },
        _id: { $ne: userId },
      });
      if (existingdisplayName) {
        return next(new ApiError("This displayName is taken!", 400));
      }
    }

    const updateData: IUpdataData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (displayName) updateData.displayName = displayName;

    const updatedProfile = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      Profile: updatedProfile,
    });

    logger.info("Profile updated successfully", updatedProfile);
  }
);
