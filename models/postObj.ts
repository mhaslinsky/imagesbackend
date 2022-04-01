import { HydratedDocument } from "mongoose";
import UserObj from "./userObj";
import CommentObj from "./commentObj";
import { Types } from "mongoose";

export default interface PostObj {
  id?: any;
  image: string;
  title: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  createDate: Date;
  creatorId: HydratedDocument<UserObj>;
  comments: Types.DocumentArray<CommentObj>;
}
