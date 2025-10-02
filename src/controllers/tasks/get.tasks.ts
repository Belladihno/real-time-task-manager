import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import ProjectMember from "@/models/project.member";
import config from "@/config/index.config";
import { paginate } from "@/utils/pagination";
import Task from "@/models/task";

export const getTasks = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { projectId } = req.body;

    const membership = await ProjectMember.findOne({
      projectId,
      userId,
      isActive: true,
    });
    if (!membership) {
      return next(new ApiError("Access denied to this project", 403));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;

    const filter: any = {
      projectId,
      isArchived: false,
    };

    const result = await paginate(Task, {
      page,
      limit,
      filter,
      select: "-__v",
      populate: "assigneeIds createdBy",
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      status: "success",
      ...result.pagination,
      tasks: result.data,
    });
  }
);
