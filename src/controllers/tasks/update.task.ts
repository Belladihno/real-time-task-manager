import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";
import Task from "@/models/task";
import ProjectMember from "@/models/project.member";

export const updateTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { taskId } = req.params;
    const updateData = req.body;

    const { error } = validator.updateTaskSchema.validate(updateData);
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
    if (!membership) {
      return next(new ApiError("Access denied to this project", 403));
    }

    if (task.isLocked) {
      const isOwnerOrManager =
        membership.role === "owner" || membership.role === "manager";
      const isCreator = task.createdBy.toString() === userId?.toString();
      const isAssignee = task.assigneeIds?.some(
        (id) => id.toString() === userId?.toString()
      );
      const hasPermission = membership.permissions.canModifyProject;

      const canModify =
        isOwnerOrManager || isCreator || isAssignee || hasPermission;

      if (!canModify) {
        return next(
          new ApiError(
            "Task is locked. Only project owner/manager/creator/assignee can modify",
            403
          )
        );
      }
    }

    if (updateData.status === "completed" && !updateData.completedDate) {
      updateData.completedDate = new Date();
    }

    if (updateData.name) {
      task.name = updateData.name;
      task.markModified("name");
    }

    if (updateData.description !== undefined) {
      task.description = updateData.description;
    }

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("projectId", "name")
      .populate("assigneeIds", "firstName")
      .populate("createdBy", "firstName");

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      task: updatedTask,
    });

    logger.info("Task updated successfully", {
      taskId,
      userId,
    });
  }
);
