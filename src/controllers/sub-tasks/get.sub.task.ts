import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task";
import ProjectMember from "@/models/project.member";
import SubTask from "@/models/sub.task";

export const getSubTaskById = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { subTaskId } = req.params;

    const subtask = await SubTask.findById(subTaskId)
      .populate("assigneeId", "firstName lastName displayName email")
      .populate("createdBy", "firstName lastName displayName email");
    if (!subtask) {
      return next(new ApiError("sub task not found", 404));
    }

    const task = await Task.findById(subtask.taskId);
    if (!task) {
      return next(new ApiError("Parent task not found", 404));
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
      subtask,
    });
  }
);
