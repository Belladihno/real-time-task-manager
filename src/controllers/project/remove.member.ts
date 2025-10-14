import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";

export const removeProjectMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserId = req.userId;
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    const currentUserMembership = await ProjectMember.findOne({
      projectId,
      userId: currentUserId,
      isActive: true,
    });
    if (
      !currentUserMembership ||
      !currentUserMembership.permissions.canManageMembers
    ) {
      return next(
        new ApiError("Permission denied to remove project members", 403)
      );
    }

    const memberToRemove = await ProjectMember.findOne({
      projectId,
      userId: memberId,
      isActive: true,
    });

    if (!memberToRemove) {
      return next(new ApiError("Member not found in this project", 404));
    }

    if (!memberToRemove.isActive) {
      return next(new ApiError("Member is already inactive", 400));
    }

    if (memberToRemove.role === "owner") {
      return next(new ApiError("Cannot remove project owner", 403));
    }

    memberToRemove.isActive = false;
    await memberToRemove.save();

    await Project.findByIdAndUpdate(projectId, {
      $inc: { memberCount: -1 },
    });

    res.status(204).json({
      status: "success",
      message: "Member removed from project successfully",
    });

    logger.info("Member removed from project", {
      projectId,
      memberId,
      removedBy: currentUserId,
    });
  }
);
