import { Posts, overWriteData } from "../DUMMY_DATA";
import HttpError from "../models/http-error";
import PostObj from "../models/postObj";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import getcoordsfromaddress from "../util/location";
import getCoordsFromAddress from "../util/location";

export function getPlaceById(req: Request, res: Response, next: NextFunction) {
  const placeId = req.params.pid;
  const filteredPosts = Posts.find((post) => {
    return post.id === placeId;
  });

  if (!filteredPosts) {
    const error: NodeJS.ErrnoException = new HttpError(
      "Could not find a place for the provided id.",
      "404"
    );
    throw error;
  }
  res.status(200).json(filteredPosts);
}

export function getPlacesByUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.params.uid;
  const filteredPosts = Posts.filter((post) => {
    return post.creatorId === userId;
  });
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

  const createdPlace: PostObj = {
    id: randomUUID(),
    title,
    description,
    coordinates,
    address,
    creatorId,
    image,
  };

  Posts.unshift(createdPlace);
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
