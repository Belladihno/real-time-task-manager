import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";

export const reactivateWorkspaceMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserId = req.userId;
    const { workspaceId, memberId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return next(new ApiError("Workspace not found", 404));
    }

    const currentUserMembership = await WorkspaceMember.findOne({
      workspaceId,
      userId: currentUserId,
      isActive: true,
    });
    if (
      !currentUserMembership ||
      !currentUserMembership.permissions.canManageMembers
    ) {
      return next(
        new ApiError(
          "Permission denied to reactivate members in this workspace",
          403
        )
      );
    }

    const memberToReactivate = await WorkspaceMember.findOne({
      workspaceId,
      userId: memberId,
    });
    if (!memberToReactivate) {
      return next(new ApiError("Member not found in this workspace", 404));
    }

    if (memberToReactivate.isActive) {
      return next(new ApiError("Member is already active", 400));
    }

    memberToReactivate.isActive = true;
    memberToReactivate.joinedAt = new Date();
    memberToReactivate.invitedBy = currentUserId;
    await memberToReactivate.save();

    await Workspace.findByIdAndUpdate(workspaceId, {
      $inc: { memberCount: 1 },
    });

    const workspaceProjects = await Project.find({
      workspaceId,
      isArchived: false,
    }).select("_id");

    const projectIds = workspaceProjects.map((p) => p._id);

    const inActiveProjectMemberships = await ProjectMember.find({
      projectId: { $in: projectIds },
      userId: memberId,
      isActive: false,
    });

    if (inActiveProjectMemberships.length > 0) {
      const affectedProjectIds = inActiveProjectMemberships.map(
        (pm) => pm.projectId
      );

      await ProjectMember.updateMany(
        { projectId: { $in: affectedProjectIds }, userId: memberId },
        { $set: { isActive: true } }
      );

      await Project.updateMany(
        { _id: { $in: affectedProjectIds } },
        { $inc: { memberCount: 1 } }
      );
    }

    const reactivatedMember = await WorkspaceMember.findById(
      memberToReactivate._id
    ).populate([
      {
        path: "userId",
        select: "firstName lastName displayName email",
      },
      { path: "invitedBy", select: "firstName lastName displayName email" },
    ]);

    res.status(200).json({
      status: "success",
      message: "Member reactivated successfully",
      member: reactivatedMember,
    });

    logger.info("Member reactivated in workspace", {
      workspaceId,
      memberId,
      reactivatedBy: currentUserId,
    });
  }
);
