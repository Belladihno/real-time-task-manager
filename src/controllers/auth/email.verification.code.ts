import User from "@/models/user.model";
import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { doHashValidation } from "@/utils/hashing";
import { ILoginData, IRegisterData, IUser } from "@/utils/interface";
import Token from "@/models/token.model";
import config from "@/config/index.config";


export const sendEmailVerificationCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return next(new ApiError("user does not exist", 404));
    }

    if (existingUser.emailVerified) {
      return next(new ApiError("user already verified", 409));
    }

    const emailCode = crypto.randomInt(100000, 1000000).toString();
  }
);
