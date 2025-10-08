import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Comment from "@/models/comment";
import { logger } from "@/lib/winston";
import Task from "@/models/task";
import ProjectMember from "@/models/project.member";

export const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new ApiError("Comment no found", 404));
    }

    let projectId;

    if (comment.commentType === "Task") {
      const task = await Task.findById(comment.commentTypeId);
      if (!task) {
        return next(new ApiError("Task not found", 404));
      }
      projectId = task.projectId;
    } else {
      projectId = comment.commentTypeId;
    }

    const membership = await ProjectMember.findOne({
      projectId,
      userId,
      isActive: true,
    });

    if (!membership) {
      return next(new ApiError("Access denied to this project", 403));
    }

    const isAuthor = comment.authorId.toString() === userId?.toString();
    const isManager =
      membership.role === "owner" || membership.role === "manager";

    if (!isAuthor && !isManager) {
      return next(
        new ApiError(
          "You can only delete your own comments or be a manager",
          403
        )
      );
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(204).json({
      status: "success",
      message: "Comment deleted successfully",
    });

    logger.info("Comment deleted successfully", {
      commentId,
      userId,
    });
  }
);
