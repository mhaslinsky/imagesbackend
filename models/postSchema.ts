import { Schema, model } from "mongoose";
import PostObj from "./postObj";

const postSchema = new Schema<PostObj>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creatorId: { type: String, required: true },
});

const PostModel = model<PostObj>("Post", postSchema);

export default PostModel;
