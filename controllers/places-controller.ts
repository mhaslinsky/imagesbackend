import { Posts, overWriteData } from "../DUMMY_DATA";
import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import getCoordsFromAddress from "../util/location";
import PostModel from "../models/postSchema";

export async function getPlaceById(
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

export async function getPlacesByUserId(
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
      "Could not find a place for the provided user id.",
      "404"
    );
    return next(error);
  }
  res.status(200).json(filteredPosts);
}

export async function createPlace(
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

export function editPlace(req: Request, res: Response, next: NextFunction) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid Inputs, Please check inputs", "422");
  }
  const { title, description, address, coordinates } = req.body;
  const postId = req.params.pid;
  const matchedPost = Posts.find((p) => p.id === postId);
  const placeIndex = Posts.findIndex((p) => p.id === postId);

  if (matchedPost && placeIndex) {
    const updatedPost = {
      ...matchedPost,
      title,
      description,
      address,
      coordinates,
    };
    Posts[placeIndex] = updatedPost;

    res.status(200).json(updatedPost);
  } else {
    const error: NodeJS.ErrnoException = new HttpError(
      "Could not find a matching post ID.",
      "404"
    );
    return next(error);
  }
}

export function deletePlace(req: Request, res: Response, next: NextFunction) {
  const postId = req.params.pid;

  if (!Posts.find((p) => p.id === postId)) {
    throw new HttpError("Could not find a place with that id", "404");
  } else {
    const filteredPosts = Posts.filter((p) => {
      return p.id !== postId;
    });
    overWriteData(filteredPosts);
    res.status(200).json({ message: "deleted post" });
  }
}
