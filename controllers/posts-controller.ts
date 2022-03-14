import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import getCoordsFromAddress from "../util/location";
import PostModel from "../models/postSchema";
import UserModel from "../models/userSchema";
import { startSession } from "mongoose";

export async function getPostById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const postId = req.params.pid;
  let filteredPosts;
  try {
    filteredPosts = await PostModel.findById(postId);
    res.status(200).json(filteredPosts!.toObject({ getters: true }));
  } catch (err) {
    return next(
      new HttpError("Could not find a post for the provided id.", "404")
    );
  }
}

export async function getPostsByUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const creatorId = req.params.uid;
  let filteredPosts;
  try {
    filteredPosts = await PostModel.find({ creatorId });
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  if (filteredPosts.length === 0) {
    const error: NodeJS.ErrnoException = new HttpError(
      "Could not find any posts for the provided user.",
      "404"
    );
    return next(error);
  }
  res.status(200).json(
    filteredPosts.map((p) => {
      return p.toObject({ getters: true });
    })
  );
}

export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid Inputs, Please check inputs", "422"));
  }
  const { title, description, creatorId, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new PostModel({
    title,
    description,
    creatorId,
    address,
    coordinates,
    image: req.file?.path,
  });

  console.log(createdPlace);

  let user;
  try {
    user = await UserModel.findById(creatorId);
  } catch (err) {
    return next(new HttpError("Could not find user with provided ID", "404"));
  }

  try {
    const postSession = await startSession();
    postSession.startTransaction();
    await createdPlace.save({ session: postSession });
    user!.posts.push(createdPlace);
    await user!.save({ session: postSession });
    await postSession.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  res.status(201).json(createdPlace.toObject({ getters: true }));
}

export async function editPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const postId = req.params.pid;
  let filteredPost;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid Inputs, Please check inputs", "422"));
  }
  const { title, description, address } = req.body;

  try {
    filteredPost = await PostModel.findById(postId);
  } catch (err) {
    return next(new HttpError("Could not find a matching post ID.", "404"));
  }

  let coordinates;

  if (filteredPost!.address !== address) {
    try {
      coordinates = await getCoordsFromAddress(address);
      filteredPost!.title = title;
      filteredPost!.description = description;
      filteredPost!.coordinates = coordinates;
      filteredPost!.address = address;
    } catch (error) {
      return next(
        new HttpError(
          "An error occured translating location, please try again.",
          "500"
        )
      );
    }
  } else {
    filteredPost!.title = title;
    filteredPost!.description = description;
  }

  try {
    await filteredPost!.save();
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  res.status(200).json(filteredPost!.toObject({ getters: true }));
}

export async function deletePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const postId = req.params.pid;

  let filteredPost;

  try {
    //populate returns document from user collection of who created post nested in creatorId key
    //this is possible due to the ref set in the postSchema
    filteredPost = await PostModel.findById(postId).populate("creatorId");
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  if (!filteredPost) {
    return next(new HttpError("Could not find a matching post ID.", "404"));
  }
  try {
    const deleteSession = await startSession();
    deleteSession.startTransaction();
    await filteredPost.remove({ session: deleteSession });
    //this is where populate comes into play. it allows us to delete the post from the user collection
    //in the same session without have to find it with a second search
    filteredPost!.creatorId.posts.pull(filteredPost);
    await filteredPost!.creatorId.save({
      session: deleteSession,
    });
    await deleteSession.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  res.status(200).json({ message: "deleted post" });
}
