import { Schema, model } from "mongoose";
import { ITask } from "@/@types/interface";
import { createSlug, generateUniqueSlug } from "@/helpers/generate.slug";

const taskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed", "cancelled"],
      default: "todo",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    assigneeIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

taskSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = createSlug(this.name);

  this.slug = await generateUniqueSlug(baseSlug, this.constructor, this._id);

  next();
});

export default model<ITask>("Task", taskSchema);
