import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task";
import { logger } from "@/lib/winston";
import ProjectMember from "@/models/project.member";
import validator from "@/middlewares/validator";
import SubTask from "@/models/sub.task";

export const createSubTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { taskId } = req.params;
    const { name, assigneeId } = req.body;

    const { error } = validator.createSubTaskSchema.validate({
      name,
      assigneeId,
    });
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const membership = await ProjectMember.findOne({
      projectId: task.projectId,
      userId,
      isActive: true,
    });
    if (!membership || !membership.permissions.canCreateTasks) {
      return next(new ApiError("Permission denied to add sub-task", 403));
    }

    const subTask = await SubTask.create({
      name,
      assigneeId,
      createdBy: userId,
      taskId,
    });

    const populatedSubTask = await SubTask.findById(subTask._id)
      .populate("assigneeId", "firstName lastName displayName email")
      .populate("createdBy", "firstName lastName displayName email");

    res.status(201).json({
      status: "success",
      message: "Subtask created successfully",
      subtask: populatedSubTask,
    });

    logger.info("Subtask created successfully", {
      subtaskId: subTask._id,
      taskId,
      name: subTask.name,
      createdBy: userId,
    });
  }
);
