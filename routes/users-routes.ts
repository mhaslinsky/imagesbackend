import express from "express";
import { getUsers, signUp, login } from "../controllers/users-controller";
import { check } from "express-validator";
const userRouter = express.Router();

const signupValidation = [
  check("username").not().isEmpty(),
  check("email").normalizeEmail().isEmail(),
  check("password").isLength({ min: 6 }),
];

userRouter.get("/", getUsers);
userRouter.post("/signup", signupValidation, signUp);
userRouter.post("/login", login);

export default userRouter;
