import { HydratedDocument } from "mongoose";
import UserObj from "./userObj";

export default interface TokenObj {
  creatorId: HydratedDocument<UserObj>;
  token: string;
  createdAt: Date;
}
