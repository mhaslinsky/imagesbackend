import { NextFunction, Request, Response } from "express";
import express from "express";

const fallBackRouter = express.Router();

fallBackRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(204).json({ message: "instaSham API" });
});

export default fallBackRouter;
