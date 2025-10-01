import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Project from "@/models/project";
import WorkspaceMember from "@/models/workspace.member";
import config from "@/config/index.config";
import { paginate } from "@/utils/pagination";

export const getProjects = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { workspaceId } = req.body;

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId,
      isActive: true,
    });
    if (!membership) {
      return next(new ApiError("Access denied to this workspace", 403));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;

    const filter: any = {
      workspaceId,
      isArchived: false,
    };

    const result = await paginate(Project, {
      page,
      limit,
      filter,
      select: "-__v",
      populate: "ownerId workspaceId",
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      status: "success",
      ...result.pagination,
      projects: result.data,
    });
  }
);
