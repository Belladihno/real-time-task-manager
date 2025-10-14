import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import { logger } from "@/lib/winston";
import { IAddMemberToWorkspace } from "@/@types/interface";
import validator from "@/middlewares/validator";
import User from "@/models/user";

export const addMemberToWorkspace = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserId = req.userId;
    const { workspaceId } = req.params;
    const memberData: IAddMemberToWorkspace = req.body;

    const { error } = validator.addworkspaceMemberSchema.validate(memberData);
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

    const userToAdd = await User.findById(memberData.userId);
    if (!userToAdd) {
      return next(new ApiError("User not found", 404));
    }

    const existingMembership = await WorkspaceMember.findOne({
      workspaceId,
      userId: memberData.userId,
    });

    if (existingMembership) {
      return next(
        new ApiError("User is already a member of this workspace", 409)
      );
    }

    const membershipData: any = {
      workspaceId,
      userId: memberData.userId,
      role: memberData.role || "member",
      invitedBy: currentUserId,
    };

    if (memberData.role === "admin") {
      membershipData.permissions = {
        canCreateProjects: true,
        canManageMembers: true,
        canDeleteWorkspace: false,
        canModifySettings: true,
      };
    }

    const newMembership = await WorkspaceMember.create(membershipData);

    await Project.findByIdAndUpdate(workspaceId, { $inc: { memberCount: 1 } });

    const populatedMembership = await WorkspaceMember.findById(
      newMembership._id
    ).populate([
      {
        path: "userId",
        select: "firstName lastName displayName email",
      },
      { path: "invitedBy", select: "firstName lastName displayName email" },
    ]);

    res.status(201).json({
      status: "success",
      message: "Member added to workspace successfully",
      member: populatedMembership,
    });

    logger.info("Member added to workspace successfully", {
      workspaceId,
      userId: memberData.userId,
      role: memberData.role || "member",
      invitedBy: currentUserId,
    });
  }
);
