import { Schema, model } from "mongoose";
import TokenObj from "./tokenObj";

const tokenSchema = new Schema<TokenObj>({
  creatorId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true },
  createdAt: { type: Date, default: new Date(Date.now()), expires: 3600 },
});

const TokenModel = model<TokenObj>("Token", tokenSchema);

export default TokenModel;
