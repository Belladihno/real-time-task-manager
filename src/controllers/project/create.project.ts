import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import { logger } from "@/lib/winston";
import { ICreateProjectData } from "@/@types/interface";
import validator from "@/middlewares/validator";

export const createProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const projectData: ICreateProjectData = req.body;

    const { error } = validator.createProjectSchema.validate(projectData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const workspace = await Workspace.findById(projectData.workspaceId);
    if (!workspace) {
      return next(new ApiError("Workspace not found", 404));
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId: projectData.workspaceId,
      userId,
      isActive: true,
    });
    if (!membership || !membership.permissions.canCreateProjects) {
      return next(
        new ApiError(
          "Permission denied to create project in this workspace",
          403
        )
      );
    }

    const newProject = await Project.create({
      ...projectData,
      ownerId: userId,
    });

    await ProjectMember.create({
      projectId: newProject._id,
      userId,
      role: "owner",
      permissions: {
        canCreateTasks: true,
        canAssignTasks: true,
        canDeleteTasks: true,
        canManageMembers: true,
        canModifyProject: true,
      },
    });

    await Workspace.findByIdAndUpdate(projectData.workspaceId, {
      $inc: { projectCount: 1 },
    });

    const populatedProject = await Project.findById(newProject._id)
      .populate("workspaceId", "name slug")
      .populate("ownerId", "firstName lastName displayName email");

    res.status(201).json({
      status: "success",
      message: "Project created successfully",
      project: populatedProject,
    });

    logger.info("Project created successfully", {
      projectId: newProject._id,
      workspaceId: projectData.workspaceId,
      name: projectData.name,
      ownerId: userId,
    });
  }
);
