import { Posts, overWriteData } from "../DUMMY_DATA";
import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import getCoordsFromAddress from "../util/location";
import PostModel from "../models/postSchema";

export async function getPostById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const postId = req.params.pid;
  let filteredPosts;
  try {
    filteredPosts = await PostModel.findById(postId);
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  if (!filteredPosts) {
    const error: NodeJS.ErrnoException = new HttpError(
      "Could not find a post for the provided id.",
      "404"
    );
    return next(error);
  }
  res.status(200).json(filteredPosts.toObject({ getters: true }));
}

export async function getPostsByUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.params.uid;
  let filteredPosts;
  try {
    filteredPosts = await PostModel.find({ creatorId: userId });
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
  const { title, description, creatorId, address, image } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new PostModel({
    title,
    description,
    address,
    coordinates,
    creatorId,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1746&q=80",
  });

  try {
    await createdPlace.save();
  } catch (err) {
    return next(err);
  }

  res.status(201).json(createdPlace);
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
    filteredPost = PostModel.findById(postId);
  } catch (err) {
    return next(new HttpError("Could not find a matching post ID.", "404"));
  }

  try {
    await filteredPost.remove();
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  res.status(200).json({ message: "deleted post" });
}
