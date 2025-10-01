import type { Request, Response, NextFunction } from "express";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import catchAsync from "@/utils/catchAsync";
import config from "@/config/index.config";
import { paginate } from "@/utils/pagination";

export const getWorkspaces = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;

    const memberships = await WorkspaceMember.find({
      userId,
      isActive: true,
    }).select("workspaceId");

    const memberWorkspaceIds = memberships.map((m) => m.workspaceId);

    const filter = {
      _id: { $in: memberWorkspaceIds },
      isArchived: false,
    };

    const result = await paginate(Workspace, {
      page,
      limit,
      filter,
      select: "-__v",
      populate: "ownerId",
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      status: "success",
      ...result.pagination,
      workspaces: result.data,
    });
  }
);
