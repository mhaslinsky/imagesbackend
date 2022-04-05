import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import PostModel from "../models/postSchema";
import UserModel from "../models/userSchema";
import { startSession } from "mongoose";
import { GetUserAuthHeader } from "../models/interfaces";
import CommentModel from "../models/commentSchema";

export async function createComment(
  req: GetUserAuthHeader,
  res: Response,
  next: NextFunction
) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid Inputs, Please check inputs", "422"));
  }

  const { comment, postId } = req.body;

  const createdComment = new CommentModel({
    creatorId: req.userData.userId,
    createDate: new Date(Date.now()).toISOString(),
    comment: comment,
    post: postId,
  });

  let user;
  try {
    user = await UserModel.findById(req.userData.userId);
  } catch (err) {
    return next(
      new HttpError("Could not find your userID, please try again", "404")
    );
  }

  let post;
  try {
    post = await PostModel.findById(postId);
  } catch (err) {
    return next(new HttpError("Could not find that post", "404"));
  }

  try {
    const commentSession = await startSession();
    commentSession.startTransaction();
    await createdComment.save({ session: commentSession });
    user!.comments.push(createdComment);
    await user!.save({ session: commentSession });
    post!.comments.push(createdComment);
    await post!.save({ session: commentSession });
    await commentSession.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  res.status(201).json(createdComment.toObject({ getters: true }));
}

export async function getComments(
  req: GetUserAuthHeader,
  res: Response,
  next: NextFunction
) {
  const post = req.params.pid;
  let comments;
  try {
    comments = await CommentModel.find({ post }).populate("creatorId");
  } catch (err) {
    console.warn(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  if (comments.length === 0) {
    res.status(200).json({ message: null });
  } else {
    res.status(200).json(
      comments.map((p) => {
        return p.toObject({ getters: true });
      })
    );
  }
}

export async function deleteComment(
  req: GetUserAuthHeader,
  res: Response,
  next: NextFunction
) {
  const { commentId } = req.body;
  let filteredComment;
  try {
    filteredComment = await CommentModel.findById(commentId)
      .populate("creatorId")
      .populate("post");
  } catch {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  if (!filteredComment) {
    return next(new HttpError("Could not find a matching comment ID.", "404"));
  }
  if (filteredComment.creatorId.id !== req.userData.userId) {
    return next(new HttpError("This isn't your post!", "401"));
  }
  try {
    const deleteSession = await startSession();
    deleteSession.startTransaction();
    await filteredComment.remove({ session: deleteSession });
    filteredComment!.creatorId.comments.pull(filteredComment);
    await filteredComment!.creatorId.save({
      session: deleteSession,
    });
    filteredComment!.post.comments.pull(filteredComment);
    await filteredComment!.post.save({
      session: deleteSession,
    });
    await deleteSession.commitTransaction();
  } catch (err) {
    console.warn(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  res.status(200).json({ message: "deleted comment" });
}
