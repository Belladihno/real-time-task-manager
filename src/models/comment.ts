import { Schema, model } from "mongoose";
import { ITaskComment } from "@/utils/interface";

const taskCommentSchema = new Schema<ITaskComment>(
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
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    mentions: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
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

export default model<ITaskComment>("TaskComment", taskCommentSchema);
