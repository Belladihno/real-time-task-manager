import config from "@/config/index.config";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import ApiError from "@/utils/apiError";
import catchAsync from "@/utils/catchAsync";
import { paginate } from "@/utils/pagination";
import { NextFunction, Request, Response } from "express";

export const getWorkspaceMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return next(new ApiError("Workspace not found", 404));
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: true,
    });
    if (!workspace.settings.isPublic && !membership) {
      return next(new ApiError("Access denied to this workspace", 403));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;

    const filter: any = {
      workspaceId,
    };

    const isActiveFilter = req.query.isActive as string;
    const canViewInactiveMembers =
      membership && ["owner", "admin"].includes(membership.role);

    if (isActiveFilter) {
      if (isActiveFilter === "false" && !canViewInactiveMembers) {
        return next(
          new ApiError(
            "Only workspace owners and admins can view inactive members",
            403
          )
        );
      }
      filter.isActive = isActiveFilter === "true";
    } else {
      filter.isActive = true;
    }

    const roleFilter = req.query.role as string;
    if (roleFilter && ["owner", "admin", "member"].includes(roleFilter)) {
      filter.role = roleFilter;
    }

    const result = await paginate(WorkspaceMember, {
      page,
      limit,
      filter,
      select: "-__v",
      populate: [
        {
          path: "userId",
          select: "firstName lastName displayName email isOnline lastSeen",
        },
        {
          path: "invitedBy",
          select: "displayName email",
        },
      ],
      sort: { joinedAt: -1 },
    });

    res.status(200).json({
      status: "success",
      ...result.pagination,
      members: result.data,
    });
  }
);
