import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";
import validator from "@/middlewares/validator";
import { IUpdateProjectMemberData } from "@/@types/interface";

export const updateProjectMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserId = req.userId;
    const { projectId, memberId } = req.params;
    const updateData: IUpdateProjectMemberData = req.body;

    const { error } = validator.updateProjectMemberSchema.validate(updateData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

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
        new ApiError("Permission denied to update project members", 403)
      );
    }

    const memberToUpdate = await ProjectMember.findOne({
      projectId,
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
      return next(new ApiError("Cannot modify project owner", 403));
    }

    memberToUpdate.role = updateData.role as "manager" | "member" | "owner";

    if (updateData.role === "manager") {
      memberToUpdate.permissions = {
        canCreateTasks: true,
        canAssignTasks: true,
        canDeleteTasks: true,
        canManageMembers: true,
        canModifyProject: true,
      };
    } else {
      memberToUpdate.permissions = {
        canCreateTasks: true,
        canAssignTasks: false,
        canDeleteTasks: false,
        canManageMembers: false,
        canModifyProject: false,
      };
    }

    await memberToUpdate.save();

    const updatedMember = await ProjectMember.findById(
      memberToUpdate._id
    ).populate([
      {
        path: "userId",
        select: "firstName lastName displayName email",
      },
      { path: "addedBy", select: "firstName lastName displayName email" },
    ]);

    res.status(200).json({
      status: "success",
      message: "Project member updated successfully",
      member: updatedMember,
    });

    logger.info("Project member updated", {
      projectId,
      memberId,
      newRole: updateData.role,
      updatedBy: currentUserId,
    });
  }
);
