import type { Request, Response, NextFunction } from "express";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";

export const getWorkspaceById = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate(
      "ownerId",
      "firstName lastName displayName email"
    );

    if (!workspace) {
      return next(new ApiError("Workspace not found", 404));
    }

    const workspaceMembership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: true,
    });

    if (!workspace.settings.isPublic && !workspaceMembership) {
      return next(new ApiError("Access denied to this workspace", 403));
    }

    res.status(200).json({
      status: "success",
      workspace: {
        ...workspace.toObject(),
        userRole: workspaceMembership?.role,
        userPermissions: workspaceMembership?.permissions,
      },
    });
  }
);
