import express from "express";
import {
  getPostById,
  getPostsByUserId,
  createPost,
  editPost,
  deletePost,
  getFeed,
} from "../controllers/posts-controller";
import { check } from "express-validator";
import fileUpload from "../middleware/file-upload";
import checkAuth from "../middleware/check-auth";

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

const commentValidation = check("comment").not().isEmpty();

//not executing here, just passing pointers
postsRouter.get("/:pid", getPostById);
postsRouter.get("/user/:uid", getPostsByUserId);
postsRouter.get("/", getFeed);
//this acts a gate stopping lower routes from being reached without a valid token in the req
postsRouter.use(checkAuth);
postsRouter.patch("/:pid", updatePostValidation, editPost);
postsRouter.delete("/:pid", deletePost);

postsRouter.post(
  "/",
  fileUpload.single("image"),
  createPostValidation,
  createPost
);

export default postsRouter;
