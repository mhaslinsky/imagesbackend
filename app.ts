import express from "express";
import { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import placesRouter from "./routes/places-routes";
import HttpError from "./models/http-error";
import userRouter from "./routes/users-routes";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
// parses any incoming data, converts from JSON to regular JS object notation and calls next
app.use(bodyParser.json());

app.use("/api/places", placesRouter);
app.use("/api/users", userRouter);

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
    if (res.headersSent) {
      return next(error);
    }
    res.status((error.code as unknown as number) || 500);
    res.json({ message: error.message || "An unknown error occured" });
  }
);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_CRED}:${process.env.DB_CRED}@cluster0.pku1z.mongodb.net/posts?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((error) => {
    console.warn(error);
  });
