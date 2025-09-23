import { Schema, model } from "mongoose";
import { ITeamMembership } from "@/utils/interface";

const teamMembershipSchema = new Schema<ITeamMembership>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default model<ITeamMembership>("TeamMembership", teamMembershipSchema);
