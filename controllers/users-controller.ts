import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import UserModel from "../models/userSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let users;
  try {
    users = await UserModel.find({}, "-password -email");
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

export async function getUserbyId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.params.uid;
  let filteredUser;

  try {
    filteredUser = await UserModel.findById(userId, "-password -posts -email");
    res.status(200).json(filteredUser!.toObject({ getters: true }));
  } catch (err) {}
}

export async function signUp(req: any, res: Response, next: NextFunction) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError(
        "Invalid account creation credentials, please make sure username is alphanumeric, email is valid, and password is at least 6 characters",
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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  const createdUser = new UserModel({
    username,
    email,
    password: hashedPassword,
    image: req.file?.location,
    places: [],
  });

  try {
    await createdUser.save({ timestamps: true });
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  let token;
  //no promise, but can still fail
  try {
    token = jwt.sign(
      //id created by mongodb
      {
        userId: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
      },
      `${process.env.SECRETKEY}`,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Authentication error, please try again.", "500")
    );
  }

  res.status(201).json({
    userId: createdUser.id,
    username: createdUser.username,
    avatar: createdUser.image,
    email: createdUser.email,
    token: token,
  });
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
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  if (!isValidPassword) {
    return next(new HttpError("Incorrect Password", "403"));
  } else {
    let token;
    try {
      token = jwt.sign(
        {
          userId: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
        },
        `${process.env.SECRETKEY}`,
        { expiresIn: "1h" }
      );
    } catch (err) {
      return next(
        new HttpError("Authentication error, please try again.", "500")
      );
    }

    res.json({
      userId: existingUser.id,
      username: existingUser.username,
      avatar: existingUser.image,
      email: existingUser.email,
      token: token,
    });
  }
}
