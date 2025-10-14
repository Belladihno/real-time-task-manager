import User from "@/models/user";
import Workspace from "@/models/workspace";
import WorkspaceMember from "@/models/workspace.member";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { doHash } from "@/utils/hashing";
import { IUser } from "@/@types/interface";
import Token from "@/models/token";
import config from "@/config/index.config";
import ms from "ms";

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

    const personalWorkspace = await Workspace.create({
      name: `${displayName}'s Space`,
      ownerId: newUser._id,
    });

    await WorkspaceMember.create({
      userId: newUser._id,
      workspaceId: personalWorkspace._id,
      role: "owner",
      permissions: {
        canCreateProjects: true,
        canManageMembers: true,
        canDeleteWorkspace: false,
        canModifySettings: true,
      },
    });

    logger.info("Personal workspace created for user:", newUser._id);

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    await Token.create({
      token: refreshToken,
      userId: newUser._id,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + ms(config.REFRESH_TOKEN_EXPIRY)),
    });
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

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: ms(config.REFRESH_TOKEN_EXPIRY),
    });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ms(config.ACCESS_TOKEN_EXPIRY),
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      status: "success",
      message: "User registered successufully",
      user: userWithoutPassword,
      personalWorkspace,
      accessToken,
    });

    logger.info("User registered successufully", {
      username: newUser.displayName,
      email: newUser.email,
      role: newUser.role,
    });
  }
);
