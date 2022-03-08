import { Schema, model } from "mongoose";
import UserObj from "./userObj";
// import mongooseUniqueValidator from "mongoose-unique-validator";

const userSchema = new Schema<UserObj>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  posts: [{ type: Schema.Types.ObjectId, required: true, ref: "Post" }],
});

// userSchema.plugin(mongooseUniqueValidator);

const UserModel = model<UserObj>("User", userSchema);

export default UserModel;