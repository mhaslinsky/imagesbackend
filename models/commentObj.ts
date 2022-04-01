import { HydratedDocument } from "mongoose";
import PostObj from "./postObj";
import UserObj from "./userObj";

export default interface CommentObj {
  creatorId: HydratedDocument<UserObj>;
  comment: string;
  createDate: Date;
  post: HydratedDocument<PostObj>;
}
