import express from "express";
import {
  getUsers,
  getUserbyId,
  signUp,
  login,
} from "../controllers/users-controller";
import { check } from "express-validator";
import fileUpload from "../middleware/file-upload";

const userRouter = express.Router();

const signupValidation = [
  check("username").not().isEmpty().isAlphanumeric(),
  check("email").normalizeEmail().isEmail(),
  check("password").isLength({ min: 6 }),
];

userRouter.get("/", getUsers);
userRouter.get("/:uid", getUserbyId);
userRouter.post(
  "/signup",
  //this tells multer to extract the image from the payload before doing rest of validation
  //multer needed as json cannot handle binary data (like imgs)
  fileUpload.single("image"),
  signupValidation,
  signUp
);
userRouter.post("/login", login);

export default userRouter;
