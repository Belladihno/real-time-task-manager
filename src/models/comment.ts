import { Schema, model } from "mongoose";
import { IComment } from "@/utils/interface";

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentType: {
      type: String,
      enum: ["Task", "Project"],
      required: true,
    },
    commentTypeId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "commentType",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IComment>("Comment", commentSchema);
