import { Types } from "mongoose";
import CommentObj from "./commentObj";
import PostObj from "./postObj";

export default interface UserObj {
  id?: string;
  username: string;
  email: string;
  password: string;
  image?: string;
  posts: Types.DocumentArray<PostObj>;
  comments: Types.DocumentArray<CommentObj>;
  description?: string;
}
