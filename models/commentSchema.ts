import { Schema, model } from "mongoose";
import CommentObj from "./commentObj";

const commentSchema = new Schema<CommentObj>(
  {
    creatorId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    comment: { type: String, required: true },
    createDate: { type: Date, required: false },
    post: { type: Schema.Types.ObjectId, required: true, ref: "Post" },
  },
  { timestamps: true }
);

const CommentModel = model<CommentObj>("Comment", commentSchema);

export default CommentModel;
