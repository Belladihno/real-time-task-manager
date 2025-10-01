import type { Request, Response, NextFunction } from "express";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import catchAsync from "@/utils/catchAsync";
import { ICreateWorkspaceData } from "@/utils/interface";
import validator from "@/middlewares/validator";
import ApiError from "@/utils/apiError";
import config from "@/config/index.config";
import { logger } from "@/lib/winston";

export const createWorkspace = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const workspaceData: ICreateWorkspaceData = req.body;

    const { error } = validator.createWorkspaceSchema.validate(workspaceData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const ownedWorkspaceCount = await Workspace.countDocuments({
      ownerId: userId,
      isArchived: false,
    });

    if (ownedWorkspaceCount >= config.maxWorkspacePerUser) {
      return next(
        new ApiError(
          `You have reached the maximum limit of ${config.maxWorkspacePerUser} workspaces`,
          400
        )
      );
    }

    const newWorkspace = await Workspace.create({
      ...workspaceData,
      ownerId: userId,
      isPersonal: false,
    });

    await WorkspaceMember.create({
      workspaceId: newWorkspace._id,
      userId,
      role: "owner",
      permissions: {
        canCreateProjects: true,
        canManageMembers: true,
        canDeleteWorkspace: true,
        canModifySettings: true,
      },
    });

    const populatedWorkspace = await Workspace.findById(
      newWorkspace._id
    ).populate("ownerId", "firstName lastName displayName email");

    res.status(201).json({
      status: "success",
      message: "Workspace created successfully",
      workspace: populatedWorkspace,
    });

    logger.info("Workspace created successfully", {
      workspaceId: newWorkspace._id,
      name: newWorkspace.name,
      ownerId: userId,
      isPersonal: false,
      totalWorkspacesOwned: ownedWorkspaceCount + 1,
    });
  }
);
