import { Schema, model } from "mongoose";
import { IProject } from "@/utils/interface";
import { IWorkspace } from "@/utils/interface";
import { createSlug, generateUniqueSlug } from "@/helpers/generate.slug";

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["active", "on-hold", "completed", "cancelled"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    taskCount: {
      type: Number,
      default: 0,
    },
    memberCount: {
      type: Number,
      default: 1,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = createSlug(this.name);

  this.slug = await generateUniqueSlug(
    baseSlug,
    this.constructor,
    this._id 
  )

  next();
})



export default model<IProject>("Project", projectSchema);
