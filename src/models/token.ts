import { Schema, model } from "mongoose";
import { IToken } from "@/utils/interface";

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export default model<IToken>("Token", tokenSchema);
