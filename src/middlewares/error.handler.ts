import ApiError from "@/utils/apiError";
import type { NextFunction, Request, Response } from "express";
import { logger } from "@/lib/winston";

interface CastError {
  path: string;
  value: any;
}

interface DuplicateField {
  keyValue: any;
}

interface ValidationError {
  errors: any;
  message: string;
}

const handleCastErrorDB = (err: CastError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

const handleDuplicateFieldsDB = (err: DuplicateField) => {
  const value = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(message, 400);
};

const handleValidationErrorDB = (err: ValidationError) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ApiError(message, 400);
};

const handleJWTError = () => {
  return new ApiError("Invalid token. Please log in again", 401);
};

const handleJWTExpiredError = () => {
  return new ApiError("Your token has expired! Please log in again.", 401);
};

const handleSyntaxError = () => {
  return new ApiError("Invalid input syntax", 400);
};

const sendErrorDev = (err: any, res: Response) => {
  logger.error("Development Error:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
  });

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  logger.error("Production Error:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
  });

  // for error we expect
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // for unexpected errors
  } else {
    logger.error("UNEXPECTED ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error("Error Handler Called:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    environment: process.env.NODE_ENV,
  });

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };

    if (err.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (err.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    if (err.name === "JsonWebTokenError") error = handleJWTError();

    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    if (err.name === "SyntaxError") error = handleSyntaxError();

    sendErrorProd(error, res);
  }
};

export default errorHandler;