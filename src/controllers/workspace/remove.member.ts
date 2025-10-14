import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";

export const removeWorkspaceMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserId = req.userId;
    const { workspaceId, memberId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || workspace.isArchived) {
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
        new ApiError("Permission denied to add members to this workspace", 403)
      );
    }

    const memberToRemove = await WorkspaceMember.findOne({
      workspaceId,
      userId: memberId,
      isActive: true,
    });

    if (!memberToRemove) {
      return next(new ApiError("Member not found in this workspace", 404));
    }

    if (!memberToRemove.isActive) {
      return next(new ApiError("Member is already inactive", 400));
    }

    if (memberToRemove.role === "owner") {
      return next(new ApiError("Cannot remove project owner", 403));
    }

    memberToRemove.isActive = false;
    await memberToRemove.save();

    await Workspace.findByIdAndUpdate(workspaceId, {
      $inc: { memberCount: -1 },
    });

    const workspaceProjects = await Project.find({ workspaceId }).select("_id");

    const projectIds = workspaceProjects.map((p) => p._id);

    const activeProjectMemberships = await ProjectMember.find({
      projectId: { $in: projectIds },
      userId: memberId,
      isActive: true,
    });

    if (activeProjectMemberships.length > 0) {
      const affectedProjectIds = activeProjectMemberships.map(
        (pm) => pm.projectId
      );

      await ProjectMember.updateMany(
        { projectId: { $in: affectedProjectIds }, userId: memberId },
        { $set: { isActive: false } }
      );

      await Project.updateMany(
        { _id: { $in: affectedProjectIds } },
        { $inc: { memberCount: -1 } }
      );
    }

    res.status(204).json({
      status: "success",
      message:
        "Member removed from workspace and their active projects successfully",
    });

    logger.info("Member removed from workspace and their projects", {
      workspaceId,
      memberId,
      removedBy: currentUserId,
    });
  }
);
