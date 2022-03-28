import express from "express";
import { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import postsRouter from "./routes/posts-routes";
import HttpError from "./models/http-error";
import userRouter from "./routes/users-routes";
import fallBackRouter from "./routes/fallback-routes";
import mongoose from "mongoose";
import "dotenv/config";
import fs from "fs";
import path from "path";

const app = express();
// parses any incoming data, converts from JSON to regular JS object notation and calls next
app.use(bodyParser.json());

//static serving, just return requested file, dont execute it
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  next();
});

app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/", fallBackRouter);

//placing generic route here at bottom of table as a catchall
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("could not find this route", "404");
  throw error;
});

app.use(
  (
    error: NodeJS.ErrnoException,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (req.file) {
      console.log(req.file);
      //TODO figure out how to delete from S3 bucket
      // fs.unlink(req.file.path, (err) => {
      //   console.warn("file deleted");
      // });
    }
    if (res.headersSent) {
      return next(error);
    }
    res.status((error.code as unknown as number) || 500);
    res.json({ message: error.message || "An unknown error occured" });
  }
);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_CRED}:${process.env.DB_CRED}@cluster0.pku1z.mongodb.net/instasham?retryWrites=true&w=majority`
  )
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`API running on PORT ${port}`);
    });
  })
  .catch((error) => {
    console.warn(error);
  });
