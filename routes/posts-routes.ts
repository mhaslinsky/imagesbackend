import express from "express";
import {
  getPostById,
  getPostsByUserId,
  createPost,
  editPost,
  deletePost,
} from "../controllers/posts-controller";
import { check } from "express-validator";
import fileUpload from "../middleware/file-upload";

const postsRouter = express.Router();

const createPostValidation = [
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty(),
];

const updatePostValidation = [
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty(),
];

postsRouter.get("/:pid", getPostById);
postsRouter.get("/user/:uid", getPostsByUserId);
postsRouter.patch("/:pid", updatePostValidation, editPost);
postsRouter.delete("/:pid", deletePost);
postsRouter.post(
  "/",
  fileUpload.single("image"),
  createPostValidation,
  createPost
);

export default postsRouter;
