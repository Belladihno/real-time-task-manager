import type { Request, Response, NextFunction } from "express";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import catchAsync from "@/utils/catchAsync";
import validator from "@/middlewares/validator";
import ApiError from "@/utils/apiError";
import { logger } from "@/lib/winston";

export const updateWorkspace = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { workspaceId } = req.params;
    const updateData = req.body;

    const { error } = validator.updateWorkspaceSchema.validate(updateData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return next(new ApiError("Workspace not found", 404));
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: true,
    });

    if (!membership || !membership.permissions.canModifySettings) {
      return next(new ApiError("Permission denied to modify workspace", 403));
    }

    Object.assign(workspace, updateData);

    if (updateData.name) {
      workspace.markModified("name");
    }

    await workspace.save();

    const updatedWorkspace = await workspace.populate([
      { path: "ownerId", select: "firstName lastName displayName email" },
    ]);

    res.status(200).json({
      status: "success",
      message: "Workspace updated successfully",
      workspace: updatedWorkspace,
    });

    logger.info("Workspace updated successfully", {
      workspaceId,
      userId,
    });
  }
);
