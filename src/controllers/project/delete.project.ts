import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import Workspace from "@/models/workspace";
import { logger } from "@/lib/winston";

export const deleteProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    if (project.ownerId.toString() !== userId?.toString()) {
      return next(new ApiError("Only project owner can delete project", 403));
    }

    await Project.findByIdAndUpdate(projectId, { isArchived: true });

    await ProjectMember.updateMany({ projectId }, { isActive: false });

    await Workspace.findByIdAndUpdate(project.workspaceId, {
      $inc: { projectCount: -1 },
    });

    res.status(204).json({
      status: "success",
      message: "Project deleted successfully",
    });

    logger.info("Project deleted successfully", {
      projectId,
      userId,
    });
  }
);
