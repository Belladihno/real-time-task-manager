import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import WorkspaceMember from "@/models/workspace.member";
import Workspace from "@/models/workspace";
import { logger } from "@/lib/winston";

export const deleteWorkspace = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return next(new ApiError("Workspace not found", 404));
    }

    if (workspace.isPersonal) {
      return next(new ApiError("Cannot delete personal workspace", 400));
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: true,
    });
    if (!membership || !membership.permissions.canDeleteWorkspace) {
      return next(new ApiError("Permission denied to delete workspace", 403));
    }

    await Workspace.findByIdAndUpdate(workspaceId, { isArchived: true });

    await WorkspaceMember.updateMany({ workspaceId }, { isActive: false });

    res.status(204).json({
      status: "success",
      message: "Workspace deleted successfully",
    });

    logger.info("Workspace deleted successfully", {
      workspaceId,
      userId,
    });
  }
);
