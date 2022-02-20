import { HydratedDocument } from "mongoose";
import UserObj from "./userObj";

export default interface PostObj {
  id?: any;
  image: string;
  title: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  creatorId: HydratedDocument<UserObj>;
}
