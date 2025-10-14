import { Schema, model } from "mongoose";
import { IProjectMember } from "@/@types/interface";

const projectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "manager", "member"],
      default: "member",
    },
    permissions: {
      canCreateTasks: {
        type: Boolean,
        default: true,
      },
      canAssignTasks: {
        type: Boolean,
        default: false,
      },
      canDeleteTasks: {
        type: Boolean,
        default: false,
      },
      canManageMembers: {
        type: Boolean,
        default: false,
      },
      canModifyProject: {
        type: Boolean,
        default: false,
      },
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IProjectMember>("ProjectMember", projectMemberSchema);
