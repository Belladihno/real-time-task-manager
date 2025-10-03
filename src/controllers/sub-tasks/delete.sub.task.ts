import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";
import SubTask from "@/models/sub.task";

export const deleteSubTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { subTaskId } = req.params;

    const subtask = await SubTask.findById(subTaskId);
    if (!subtask) {
      return next(new ApiError("Subtask not found", 404));
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

    if (!membership || !membership.permissions.canDeleteTasks) {
      return next(new ApiError("Access denied to this project", 403));
    }

    await SubTask.findByIdAndDelete(subTaskId);

    res.status(200).json({
      status: "success",
      message: "Subtask deleted successfully",
    });

    logger.info("Subtask deleted successfully", {
      subTaskId,
      userId,
    });
  }
);
