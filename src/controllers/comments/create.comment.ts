import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Comment from "@/models/comment";
import Task from "@/models/task";
import Project from "@/models/project";
import ProjectMember from "@/models/project.member";
import { logger } from "@/lib/winston";
import { ICreateCommentData } from "@/utils/interface";
import validator from "@/middlewares/validator";

export const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const commentData: ICreateCommentData = req.body;

    const { error } = validator.createCommentSchema.validate(commentData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    if (!["Task", "Project"].includes(commentData.commentType)) {
      return next(
        new ApiError("commentType must be either 'Task' or 'Project'", 400)
      );
    }

    let projectId;

    if (commentData.commentType === "Task") {
      const task = await Task.findById(commentData.commentTypeId);
      if (!task) {
        return next(new ApiError("Task not found", 404));
      }

      projectId = task.projectId;
    } else {
      const project = await Project.findById(commentData.commentTypeId);
      if (!project) {
        return next(new ApiError("Project not found", 404));
      }

      projectId = commentData.commentTypeId;
    }

    const membership = await ProjectMember.findOne({
      projectId,
      userId,
      isActive: true,
    });

    if (!membership) {
      return next(new ApiError("Access denied to this project", 403));
    }

    const newComment = await Comment.create({
      ...commentData,
      authorId: userId,
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate("authorId", "firstName lastName displayName email")
      .populate("mentions", "firstName lastName displayName email");

    res.status(201).json({
      status: "success",
      message: "Comment created successfully",
      comment: populatedComment,
    });

    logger.info("Comment created successfully", {
      commentId: newComment._id,
      commentType: commentData.commentType,
      commentTypeId: commentData.commentTypeId,
      authorId: userId,
    });
  }
);
