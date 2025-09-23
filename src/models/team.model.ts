import { Schema, model } from "mongoose";
import { ITeam } from "@/utils/interface";

const teamSchema = new Schema<ITeam>(
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
    memberCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default model<ITeam>("Team", teamSchema);
