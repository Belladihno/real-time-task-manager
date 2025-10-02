import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";

export const deleteTask = catchAsync(
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

    if (task.isLocked) {
      const isOwnerOrManager =
        membership.role === "owner" || membership.role === "manager";
      const isCreator = task.createdBy.toString() === userId?.toString();
      const hasPermission = membership.permissions.canDeleteTasks;

      const canDelete = isOwnerOrManager || isCreator || hasPermission;

      if (!canDelete) {
        return next(new ApiError("Permission denied to delete task", 403));
      }
    }

    await Task.findByIdAndUpdate(taskId, { isArchived: true });

    await Project.findByIdAndUpdate(task.projectId, {
      $inc: { taskCount: -1 },
    });

    res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
    });

    logger.info("Task deleted successfully", {
      taskId,
      userId,
    });
  }
);
