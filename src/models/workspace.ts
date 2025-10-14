import { Schema, model } from "mongoose";
import { IWorkspace } from "@/@types/interface";
import { createSlug, generateUniqueSlug } from "@/helpers/generate.slug";
 

const workspaceSchema = new Schema<IWorkspace>(
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
      maxlength: 500,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    settings: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },
      defaultProjectVisibility: {
        type: String,
        enum: ["public", "private"],
        default: "private",
      },
    },
    memberCount: {
      type: Number,
      default: 1,
    },
    projectCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPersonal: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);



workspaceSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = createSlug(this.name);

  this.slug = await generateUniqueSlug(
    baseSlug,
    this.constructor,
    this._id 
  )

  next();
})

export default model<IWorkspace>("Workspace", workspaceSchema);
