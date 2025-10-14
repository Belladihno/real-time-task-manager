import { Schema, model } from "mongoose";
import { IWorkspaceMember } from "@/@types/interface";

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    permissions: {
      canCreateProjects: {
        type: Boolean,
        default: false,
      },
      canManageMembers: {
        type: Boolean,
        default: false,
      },
      canDeleteWorkspace: {
        type: Boolean,
        default: false,
      },
      canModifySettings: {
        type: Boolean,
        default: false,
      },
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
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

export default model<IWorkspaceMember>("WorkspaceMember", workspaceMemberSchema);