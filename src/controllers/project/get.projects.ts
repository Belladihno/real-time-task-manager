import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import WorkspaceMember from "@/models/workspace.member";

export const getProjects = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { workspaceId } = req.params;

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: true,
    });
    if (!membership) {
      return next(new ApiError("Access denied to this workspace", 403));
    }
  }
);
