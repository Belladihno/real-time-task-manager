import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import ProjectMember from "@/models/project.member";
import Comment from "@/models/comment";
import Task from "@/models/task";
import Project from "@/models/project";
import config from "@/config/index.config";
import { paginate } from "@/utils/pagination";

export const getComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { commentType, commentTypeId } = req.body;

    if (!["Task", "Project"].includes(commentType)) {
      return next(
        new ApiError("commentType must be either 'Task' or 'Project'", 400)
      );
    }

    let projectId;

    if (commentType === "Task") {
      const task = await Task.findById(commentTypeId);
      if (!task) {
        return next(new ApiError("Task not found", 404));
      }

      projectId = task.projectId;
    } else {
      const project = await Project.findById(commentTypeId);
      if (!project) {
        return next(new ApiError("Project not found", 404));
      }

      projectId = commentTypeId;
    }

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
      commentType,
      commentTypeId,
    };

    const result = await paginate(Comment, {
      page,
      limit,
      filter,
      select: "-__v",
      populate: [
        { path: "authorId", select: "displayName" },
        { path: "mentions", select: "displayName" },
      ],
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      status: "success",
      ...result.pagination,
      comments: result.data,
    });
  }
);
