import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";
import Task from "@/models/task";
import ProjectMember from "@/models/project.member";
import SubTask from "@/models/sub.task";

export const updateSubTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { subTaskId } = req.params;
    const updateData = req.body;

    const { error } = validator.updateSubTaskSchema.validate(updateData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const subtask = await SubTask.findById(subTaskId);
    if (!subtask) {
      return next(new ApiError("sub task not found", 404));
    }

    const task = await Task.findById(subtask.taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const membership = await ProjectMember.findOne({
      projectId: task.projectId,
      userId,
      isActive: true,
    });
    if (!membership || !membership.permissions.canModifyProject) {
      return next(new ApiError("Access denied to this project", 403));
    }

    if (updateData.status === "done" && !subtask.completedAt) {
      updateData.completedAt = new Date();
    }

    Object.assign(subtask, updateData);

    if (updateData.name) {
      subtask.markModified("name");
    }

    await subtask.save();

    const updatedSubTask = await subtask.populate([
      { path: "assigneeId", select: "firstName lastName displayName email" },
      { path: "createdBy", select: "firstName lastName displayName email" }
    ]);

    res.status(200).json({
      status: "success",
      message: "Subtask updated successfully",
      subtask: updatedSubTask
    });

    logger.info("Subtask updated successfully", {
      subTaskId,
      userId,
    });
  }
);
