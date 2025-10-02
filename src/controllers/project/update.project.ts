import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";

export const updateProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { projectId } = req.params;
    const updateData = req.body;

    const { error } = validator.updateProjectSchema.validate(updateData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    const membership = await ProjectMember.findOne({
      projectId,
      userId,
      isActive: true,
    });
    if (!membership || !membership.permissions.canModifyProject) {
      return next(new ApiError("Permission denied to modify project", 403));
    }

    if (updateData.status === "completed" && !updateData.completedDate) {
      updateData.completedDate = new Date();
    }

    if (updateData.name) {
      project.name = updateData.name;
      project.markModified("name");
    }

    if (updateData.description !== undefined) {
      project.description = updateData.description;
    }

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("workspaceId", "name slug")
      .populate("ownerId", "displayName email");

    res.status(200).json({
      status: "success",
      message: "Project updated successfully",
      project: updatedProject,
    });

    logger.info("Project updated successfully", {
      projectId,
      userId,
    });
  }
);
