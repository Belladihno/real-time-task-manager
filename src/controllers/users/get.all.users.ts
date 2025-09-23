import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import User from "@/models/user.model";
import config from "@/config/index.config";
import { paginate } from "@/utils/pagination";

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;

    const result = await paginate(User, {
      page,
      limit,
      select: "-__v",
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      ...result.pagination,
      users: result.data,
    });
  }
);
