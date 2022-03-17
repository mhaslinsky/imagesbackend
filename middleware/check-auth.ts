import HttpError from "../models/http-error";
import jwt, { JwtPayload } from "jsonwebtoken";
import { GetUserAuthHeader } from "../models/interfaces";
import { Response, NextFunction } from "express";

const checkAuth = (
  req: GetUserAuthHeader,
  res: Response,
  next: NextFunction
) => {
  //Authorization: 'Bearer TOKEN'
  let token: string;
  try {
    //needed for browser convention, before intended method/verb is sent, browser
    //sends OPTIONS request to check if server accepts the incoming verb
    if (req.method === "OPTIONS") {
      return next();
    }
    token = (req.headers.authorization as string).split(" ")[1];
    if (!token) {
      return next(new HttpError("Auth token missing.", "401"));
    }

    const decodedToken: JwtPayload = jwt.verify(
      token,
      `${process.env.SECRETKEY}`
    ) as JwtPayload;

    req.userData = { userId: decodedToken.userId };

    next();
  } catch (err) {
    console.log(err);
    //error is header isnt formatted or split correctly, or token missing
    return next(new HttpError("Authorization failed.", "401"));
  }
};

export default checkAuth;
