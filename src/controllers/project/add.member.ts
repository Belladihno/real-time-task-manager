import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import WorkspaceMember from "@/models/workspace.member";
import { logger } from "@/lib/winston";
import { IAddMemberToProject } from "@/@types/interface";
import validator from "@/middlewares/validator";
import User from "@/models/user";
import Workspace from "@/models/workspace";

export const addMemberToProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserId = req.userId;
    const { projectId } = req.params;
    const memberData: IAddMemberToProject = req.body;

    const { error } = validator.addProjectMemberSchema.validate(memberData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    if (project.isArchived) {
      return next(new ApiError("Cannot add members to archived project", 400));
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
        new ApiError("Permission denied to add members to this project", 403)
      );
    }

    const userToAdd = await User.findById(memberData.userId);
    if (!userToAdd) {
      return next(new ApiError("User not found", 404));
    }

    const workspaceMembership = await WorkspaceMember.findOne({
      workspaceId: project.workspaceId,
      userId: memberData.userId,
    });

    if (!workspaceMembership || !workspaceMembership.isActive) {
      if (!workspaceMembership) {
        await WorkspaceMember.create({
          workspaceId: project.workspaceId,
          userId: memberData.userId,
          role: "member",
          invitedBy: currentUserId,
        });

        await Workspace.findByIdAndUpdate(project.workspaceId, {
          $inc: { memberCount: 1 },
        });

        logger.info("User auto-added to workspace", {
          workspaceId: project.workspaceId,
          userId: memberData.userId,
          reason: "project_member_addition",
        });
      } else {
        return next(
          new ApiError(
            "User is inactive in this workspace. Reactivate user",
            403
          )
        );
      }
    }

    const existingMembership = await ProjectMember.findOne({
      projectId,
      userId: memberData.userId,
    });

    if (existingMembership) {
      return next(
        new ApiError("User is already a member of this project", 409)
      );
    }

    const membershipData: any = {
      projectId,
      userId: memberData.userId,
      role: memberData.role || "member",
      addedBy: currentUserId,
    };

    if (memberData.role === "manager") {
      membershipData.permissions = {
        canCreateTasks: true,
        canAssignTasks: true,
        canDeleteTasks: true,
        canManageMembers: true,
        canModifyProject: true,
      };
    }

    const newMembership = await ProjectMember.create(membershipData);

    await Project.findByIdAndUpdate(projectId, { $inc: { memberCount: 1 } });

    const populatedMembership = await ProjectMember.findById(
      newMembership._id
    ).populate([
      {
        path: "userId",
        select: "firstName lastName displayName email",
      },
      { path: "addedBy", select: "firstName lastName displayName email" },
    ]);

    res.status(201).json({
      status: "success",
      message: "Member added to project successfully",
      member: populatedMembership,
    });

    logger.info("Member added to project successfully", {
      projectId,
      userId: memberData.userId,
      role: memberData.role || "member",
      addedBy: currentUserId,
    });
  }
);
