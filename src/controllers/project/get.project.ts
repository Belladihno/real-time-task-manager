import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import WorkspaceMember from "@/models/workspace.member";


export const getProjectById = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId)
      .populate("workspaceId", "name")
      .populate("ownerId", "firstName lastName displayName email");

    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    const workspaceMembership = await WorkspaceMember.findOne({
      workspaceId: project.workspaceId,
      userId,
      isActive: true,
    });

    if (!workspaceMembership) {
      return next(new ApiError("Access denied to this workspace", 403));
    }

    const projectMembership = await ProjectMember.findOne({
      projectId,
      userId,
      isActive: true,
    });

    if (!projectMembership && project.visibility === "private") {
      return next(new ApiError("Access denied to this project", 403));
    }

    res.status(200).json({
      status: "success",
      project: {
        ...project.toObject(),
        userRole: projectMembership?.role,
        userPermissions: projectMembership?.permissions,
      },
    });
  }
);
