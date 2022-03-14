import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import UserModel from "../models/userSchema";
import { create } from "domain";

export async function getUsers(req: any, res: any, next: any) {
  let users;
  try {
    users = await UserModel.find({}, "-password");
  } catch (err) {
    return next(
      new HttpError("Fetching users failed, please try again.", "500")
    );
  }
  res.json(
    users.map((u) => {
      return u.toObject({ getters: true });
    })
  );
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError(
        "Invalid account creation credentials, please make sure email is valid and password is at least 6 characters",
        "422"
      )
    );
  }
  const { username, email, password } = req.body;
  let existingEmail, existingUsername;
  try {
    existingEmail = await UserModel.findOne({ email: email });
    existingUsername = await UserModel.findOne({ username: username });
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  if (existingEmail) {
    return next(
      new HttpError(
        "A user already exists with that email, please try another email address",
        "422"
      )
    );
  }
  if (existingUsername) {
    return next(
      new HttpError(
        "A user already exists with that username, please try another",
        "422"
      )
    );
  }

  const createdUser = new UserModel({
    username,
    email,
    password,
    image: req.file?.path,
    places: [],
  });

  console.log(createdUser);

  try {
    await createdUser.save();
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  res.status(201).json(createdUser.toObject({ getters: true }));
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  if (!existingUser) {
    return next(new HttpError("Could not find a user with that email", "401"));
  }
  if (existingUser.password !== password) {
    return next(new HttpError("Incorrect Password", "401"));
  } else {
    res.json({
      message: "Logged In",
      user: existingUser.toObject({ getters: true }),
    });
  }
}
