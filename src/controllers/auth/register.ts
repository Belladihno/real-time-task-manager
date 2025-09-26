import User from "@/models/user.model";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { doHash } from "@/utils/hashing";
import { IUser } from "@/utils/interface";
import Token from "@/models/token.model";
import config from "@/config/index.config";

type UserData = Pick<
  IUser,
  "firstName" | "lastName" | "displayName" | "email" | "password" | "role"
>;

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      displayName,
      email,
      password,
      role = "user",
    }: UserData = req.body;

    const { error } = validator.registerSchema.validate({
      firstName,
      lastName,
      displayName,
      email,
      password,
      role,
    });

    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    if (role === "admin" && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
      logger.warn(
        `User with email ${email} tried to register as an admin but is not in the whitelist`
      );
      return next(new ApiError("You cannot register as an admin", 403));
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { displayName }],
    });

    if (existingUser) {
      const existingField =
        existingUser.email === email ? "email" : "displayName";
      return next(
        new ApiError(`User with this ${existingField} already exists`, 409)
      );
    }

    const hashedPassword = await doHash(password, 12);

    const newUser = await User.create({
      firstName,
      lastName,
      displayName,
      email,
      password: hashedPassword,
      role,
    });

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    await Token.create({ token: refreshToken, userId: newUser._id });
    logger.info("Refresh Token created for user", {
      userId: newUser._id,
      token: refreshToken,
    });

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, cookieOptions);

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      status: "success",
      message: "User registered successufully",
      user: userWithoutPassword,
      accessToken,
    });

    logger.info("User registered successufully", {
      username: newUser.displayName,
      email: newUser.email,
      role: newUser.role,
    });
  }
);
