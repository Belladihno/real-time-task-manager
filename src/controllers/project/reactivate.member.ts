import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";

export const reactivateProjectMember = catchAsync(
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
        new ApiError(
          "Permission denied to reactivate members in this project",
          403
        )
      );
    }

    const memberToReactivate = await ProjectMember.findOne({
      projectId,
      userId: memberId,
    });
    if (!memberToReactivate) {
      return next(new ApiError("Member not found in this project", 404));
    }

    if (memberToReactivate.isActive) {
      return next(new ApiError("Member is already active", 400));
    }

    memberToReactivate.isActive = true;
    memberToReactivate.joinedAt = new Date();
    memberToReactivate.addedBy = currentUserId;
    await memberToReactivate.save();

    await Project.findByIdAndUpdate(projectId, {
      $inc: { memberCount: 1 },
    });

    const reactivatedMember = await ProjectMember.findById(
      memberToReactivate._id
    ).populate([
      {
        path: "userId",
        select: "firstName lastName displayName email",
      },
      { path: "addedBy", select: "firstName lastName displayName email" },
    ]);

    res.status(200).json({
      status: "success",
      message: "Member reactivated successfully",
      member: reactivatedMember,
    });

    logger.info("Member reactivated in project", {
      projectId,
      memberId,
      reactivatedBy: currentUserId,
    });
  }
);
