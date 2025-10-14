import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task";
import { logger } from "@/lib/winston";
import { ICreateTaskData } from "@/@types/interface";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import validator from "@/middlewares/validator";

export const createTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const taskData: ICreateTaskData = req.body;

    const { error } = validator.createTaskSchema.validate(taskData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const project = await Project.findById(taskData.projectId);
    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    const membership = await ProjectMember.findOne({
      projectId: taskData.projectId,
      userId,
      isActive: true,
    });
    if (!membership || !membership.permissions.canCreateTasks) {
      return next(
        new ApiError("Permission denied to create task in this project", 403)
      );
    }

    if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
      if (!membership.permissions.canAssignTasks) {
        return next(new ApiError("Permission denied to assign tasks", 403));
      }
    }

    const newTask = await Task.create({
      ...taskData,
      createdBy: userId,
    });

    await Project.findByIdAndUpdate(taskData.projectId, {
      $inc: { taskCount: 1 },
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate("projectId", "name slug")
      .populate("assigneeIds", "firstName lastName displayName email")
      .populate("createdBy", "firstName lastName displayName email");

    res.status(201).json({
      status: "success",
      message: "Task created successfully",
      task: populatedTask,
    });

    logger.info("Task created successfully", {
      taskId: newTask._id,
      projectId: taskData.projectId,
      name: taskData.name,
      createdBy: userId,
    });
  }
);
