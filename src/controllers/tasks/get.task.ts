import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task";
import ProjectMember from "@/models/project.member";

export const getTaskById = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const membership = await ProjectMember.findOne({
      projectId: task.projectId,
      userId,
      isActive: true,
    });
    if (!membership) {
      return next(new ApiError("Access denied to this project", 403));
    }

    res.status(200).json({
      status: "success",
      task,
    });
  }
);
