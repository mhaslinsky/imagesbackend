import express from "express";
import PostObj from "../models/postObj";
import HttpError from "../models/http-error";

const placesRouter = express.Router();

const post1: PostObj = {
  id: "p1",
  image:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1746&q=80",
  title: "My day off!",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  creatorId: "u1",
  address: "Atlantic City, NJ",
  coordinates: { lat: 39.3651633, lng: -74.4246609 },
};
const post2: PostObj = {
  id: "p2",
  image:
    "https://images.unsplash.com/photo-1586751287766-b0d6eaee95ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
  title: "Vacay!",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  creatorId: "u2",
  address: "Port Republic, NJ",
  coordinates: { lat: 39.52071742405363, lng: -74.50259282157384 },
};
const Posts: PostObj[] = [post1, post2];

placesRouter.get("/:pid", (req: any, res: any, next: any) => {
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

  res.json(filteredPosts);
});

placesRouter.get("/user/:uid", (req: any, res: any, next: any) => {
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
  res.json(filteredPosts);
});

export default placesRouter;
