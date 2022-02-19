import { Types, HydratedDocument } from "mongoose";
import UserObj from "./userObj";
import PostModel from "./postSchema";
import { model } from "mongoose";

export default interface PostObj {
  id?: any;
  image: string;
  title: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  creatorId: HydratedDocument<UserObj>;
}
