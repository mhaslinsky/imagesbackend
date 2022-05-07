import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import UserModel from "../models/userSchema";
import TokenModel from "../models/tokenSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GetUserAuthHeader } from "../models/interfaces";
import sendEmail from "../util/sendEmail";
import crypto from "crypto";
import { startSession } from "mongoose";

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
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
}

export async function getUserbyName(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const username = req.params.un;
  let filteredUser;
  try {
    filteredUser = await UserModel.findOne({ username }, "-password -email");
    res.status(200).json(filteredUser!.toObject({ getters: true }));
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
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
    description: null,
    password: hashedPassword,
    image: req.file?.location,
    verified: false,
    places: [],
  });

  const createdToken = new TokenModel({
    creatorId: createdUser._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  const url = `${process.env.BASE_URL}/api/users/${createdUser._id}/verify/${createdToken.token}`;
  try {
    await sendEmail(createdUser.email, "Verification Email", url);
  } catch (err) {
    console.log(err);
  }

  try {
    const tokenSession = await startSession();
    tokenSession.startTransaction();
    await createdUser.save({ session: tokenSession });
    await createdToken.save({ session: tokenSession });
    await tokenSession.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  res.status(201).send({
    message:
      "An e-mail has been sent to your entered address. Please check for and then follow the validation link.",
  });

  // let token;
  // //no promise, but can still fail
  // try {
  //   token = jwt.sign(
  //     //id created by mongodb
  //     {
  //       userId: createdUser.id,
  //       username: createdUser.username,
  //       email: createdUser.email,
  //     },
  //     `${process.env.SECRETKEY}`,
  //     { expiresIn: "1h" }
  //   );
  // } catch (err) {
  //   return next(
  //     new HttpError("Authentication error, please try again.", "500")
  //   );
  // }

  // res.status(201).json({
  //   userId: createdUser.id,
  //   username: createdUser.username,
  //   avatar: createdUser.image,
  //   email: createdUser.email,
  //   token: token,
  // });
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

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.params.uid;
  const sentToken = req.params.token;
  let user: any, token: any;

  try {
    user = await UserModel.findById(userId, "-password -posts -email");
    if (!user) return next(new HttpError("Invalid Link", "400"));
    token = await TokenModel.findOne({ token: sentToken });
    if (!token) return next(new HttpError("Invalid Link", "400"));
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }

  if (String(token!.creatorId) == String(user!._id)) {
    try {
      const tokenSession = await startSession();
      tokenSession.startTransaction();
      await UserModel.updateOne(
        {
          _id: user._id,
        },
        { verified: true }
      ).session(tokenSession);
      await token.remove({ session: tokenSession });
      await tokenSession.commitTransaction();
    } catch (err) {
      console.log(err);
      return next(
        new HttpError("A communication error occured, please try again.", "500")
      );
    }
    res.status(200).json({ message: "User Account Verified!" });
  } else {
    return next(
      new HttpError("Verification token and user do not match!", "400")
    );
  }
}

export async function setDescription(
  req: GetUserAuthHeader,
  res: Response,
  next: NextFunction
) {
  const username = req.params.un;
  let filteredUser;
  try {
    filteredUser = await UserModel.findOne({ username }, "-password -email");
  } catch (err) {
    console.log(err);
  }
  if (req.userData.userId !== filteredUser?.id.toString()) {
    return next(new HttpError("This isn't your profile!", "401"));
  }
}
