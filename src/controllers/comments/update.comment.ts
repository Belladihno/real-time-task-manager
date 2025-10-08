import type { Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import ApiError from "@/utils/apiError";
import Comment from "@/models/comment";
import validator from "@/middlewares/validator";
import { logger } from "@/lib/winston";


export const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    const { commentId } = req.params;
    const { content } = req.body;

    const { error } = validator.updateCommentSchema.validate({ content });
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new ApiError("Comment no found", 404));
    }

    if (comment.authorId.toString() !== userId?.toString()) {
      return next(new ApiError("You can only edit your own comments", 403));
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const updatedComment = await comment.populate([
      { path: "authorId", select: "displayName" },
      { path: "mentions", select: "displayName" },
    ]);

    res.status(200).json({
      status: "success",
      message: "Comment updated successfully",
      comment: updatedComment,
    });

    logger.info("Comment updated successfully", {
      commentId,
      userId,
    });
  }
);
