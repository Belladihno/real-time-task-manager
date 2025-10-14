import User from "@/models/user";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { doHashValidation } from "@/utils/hashing";
import { IUser } from "@/@types/interface";
import Token from "@/models/token";
import config from "@/config/index.config";
import ms from "ms";

type UserData = Pick<IUser, "email" | "password">;

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password }: UserData = req.body;
    const { error } = validator.loginSchema.validate({
      email,
      password,
    });
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const existingUser = await User.findOne({ email }).select("+password");
    if (
      !existingUser ||
      !(await doHashValidation(password, existingUser.password))
    ) {
      return next(new ApiError("Invalid email or password", 401));
    }

    const accessToken = generateAccessToken(existingUser._id);

    let refreshToken: string;

    const existingToken = await Token.findOne({
      userId: existingUser._id,
    }).sort({ createdAt: -1 });

    if (existingToken) {
      refreshToken = existingToken.token;

      logger.info("Reusing existing refresh token for user", {
        userId: existingUser._id,
      });
    } else {
      refreshToken = generateRefreshToken(existingUser._id);

      await Token.create({
        token: refreshToken,
        userId: existingUser._id,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + ms(config.REFRESH_TOKEN_EXPIRY)),
      });

      logger.info("New refresh token created for user", {
        userId: existingUser._id,
        token: refreshToken,
      });
    }

    existingUser.isOnline = true;

    await existingUser.save();

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

    const { password: _, ...userWithoutPassword } = existingUser.toObject();

    res.status(200).json({
      status: "success",
      message: "User login successufully",
      user: userWithoutPassword,
      accessToken,
    });

    logger.info("User login successufully", {
      userId: existingUser._id,
    });
  }
);
