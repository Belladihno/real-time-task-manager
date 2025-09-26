import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task.model";
import User from "@/models/user.model";
import Workspace from "@/models/workspace.model";
import { logger } from "@/lib/winston";
import { ICreateTaskData } from "@/utils/interface";
import taskValidator from "@/middlewares/task.validator";

export const createTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const taskData: ICreateTaskData = req.body;

    const { error } = taskValidator.createTaskSchema.validate(taskData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }
  }
);
