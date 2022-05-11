import express from "express";
import {
  getUsers,
  getUserbyId,
  signUp,
  login,
  getUserbyName,
  setDescription,
  verifyEmail,
  requestPasswordReset,
  checkEmailRP,
  resetPass,
} from "../controllers/users-controller";
import { check } from "express-validator";
import fileUpload from "../middleware/file-upload";
import checkAuth from "../middleware/check-auth";

const userRouter = express.Router();

const signupValidation = [
  check("username").not().isEmpty().isAlphanumeric(),
  check("email").normalizeEmail().isEmail(),
  check("password").isLength({ min: 6 }),
];

const pwRestValidation = check("password").isLength({ min: 6 });

const resetValidation = check("email").normalizeEmail().isEmail();

userRouter.get("/", getUsers);

userRouter.get("/:uid", getUserbyId);
userRouter.get("/un/:un", getUserbyName);
userRouter.get("/:uid/verify/:token", verifyEmail);
userRouter.get("/:uid/requestPWR/:token", checkEmailRP);
userRouter.post("/:uid/resetPass/:token", pwRestValidation, resetPass);
userRouter.post("/pwreset", resetValidation, requestPasswordReset);
userRouter.post(
  "/signup",
  //this tells multer to extract the image from the payload before doing rest of validation
  //multer needed as json cannot handle binary data (like imgs)
  fileUpload.single("image"),
  signupValidation,
  signUp
);
userRouter.post("/login", login);
userRouter.use(checkAuth);
userRouter.patch("/description/:un", setDescription);

export default userRouter;
