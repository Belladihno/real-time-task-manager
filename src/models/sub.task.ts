import { Schema, model } from "mongoose";
import { ISubTask } from "@/@types/interface";
import { createSlug, generateUniqueSlug } from "@/helpers/generate.slug";

const subTaskSchema = new Schema<ISubTask>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "done"],
      default: "todo",
      required: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

subTaskSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = createSlug(this.name);

  this.slug = await generateUniqueSlug(baseSlug, this.constructor, this._id);

  next();
});

export default model<ISubTask>("SubTask", subTaskSchema);
