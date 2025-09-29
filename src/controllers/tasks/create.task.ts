import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Task from "@/models/task";
import User from "@/models/user";
import { logger } from "@/lib/winston";
import { ICreateTaskData } from "@/utils/interface";


export const createTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    
  }
);
