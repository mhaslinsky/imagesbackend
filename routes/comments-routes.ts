import express from "express";
import checkAuth from "../middleware/check-auth";
import { check } from "express-validator";
import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/comments-controller";

const commentsRouter = express.Router();

const commentValidation = check("comment").not().isEmpty();

commentsRouter.get("/:pid", getComments);
commentsRouter.use(checkAuth);
commentsRouter.post("/:pid", commentValidation, createComment);
commentsRouter.delete("/delete", deleteComment);

export default commentsRouter;
