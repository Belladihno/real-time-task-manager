import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import { logger } from "@/lib/winston";
import validator from "@/middlewares/validator";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import { IUpdateWorkspaceMemberData } from "@/@types/interface";

export const updateWorkspaceMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserId = req.userId;
    const { workspaceId, memberId } = req.params;
    const updateData: IUpdateWorkspaceMemberData = req.body;

    const { error } =
      validator.updateWorkspaceMemberSchema.validate(updateData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

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

    const memberToUpdate = await WorkspaceMember.findOne({
      workspaceId,
      userId: memberId,
      isActive: true,
    });

    if (!memberToUpdate) {
      return next(new ApiError("Member not found in this project", 404));
    }

    if (!memberToUpdate.isActive) {
      return next(
        new ApiError("Cannot update inactive member. Reactivate first", 400)
      );
    }

    if (memberToUpdate.role === "owner") {
      return next(new ApiError("Cannot modify workspace owner", 403));
    }

    memberToUpdate.role = updateData.role as "admin" | "member" | "owner";

    if (updateData.role === "admin") {
      memberToUpdate.permissions = {
        canCreateProjects: true,
        canManageMembers: true,
        canDeleteWorkspace: false,
        canModifySettings: true,
      };
    } else {
      memberToUpdate.permissions = {
        canCreateProjects: false,
        canManageMembers: false,
        canDeleteWorkspace: false,
        canModifySettings: false,
      };
    }

    await memberToUpdate.save();

    const updatedMember = await WorkspaceMember.findById(
      memberToUpdate._id
    ).populate([
      {
        path: "userId",
        select: "firstName lastName displayName email",
      },
      { path: "invitedBy", select: "firstName lastName displayName email" },
    ]);

    res.status(200).json({
      status: "success",
      message: "Workspace member updated successfully",
      member: updatedMember,
    });

    logger.info("Project member updated", {
      workspaceId,
      memberId,
      newRole: updateData.role,
      invitedBy: currentUserId,
    });
  }
);
