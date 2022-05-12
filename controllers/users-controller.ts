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
  const url = `${process.env.FE_URL}/verify/${createdUser._id}/${createdToken.token}`;
  try {
    await sendEmail(
      createdUser.email,
      "Verification Email",
      `<div style="font-weight: 400">Thank you for joining <strong style="color: #2b0075">Insta-sham!</strong> To finish signing up, you just need to confirm we've got your correct email address.</div>
      <div style="font-weight: 900">Please click the following link to confirm your email: <a href="${url}">Click Here!</a></div>`
    );
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
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

  if (!existingUser)
    return next(new HttpError("Could not find a user with that email", "401"));
  if (!existingUser.verified) {
    let token = await TokenModel.findOne({ creatorId: existingUser._id });
    if (!token) {
      const createdToken = new TokenModel({
        creatorId: existingUser._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      const url = `${process.env.FE_URL}/verify/${existingUser._id}/${createdToken.token}`;
      try {
        await createdToken.save();
        await sendEmail(
          existingUser.email,
          "Verification Email",
          `Please click the following link to confirm your email: <a href="${url}">Click Here!</a>`
        );
      } catch (err) {
        console.log(err);
        return next(
          new HttpError(
            "A Communication Error Occured, Please Try Again.",
            "500"
          )
        );
      }
      return next(
        new HttpError(
          "Account email not verified. Your old verification email has expired. Sending a new one! Please click the link in the email sent by us, check your spam folder if having trouble finding it.",
          "403"
        )
      );
    }
    return next(
      new HttpError(
        "User account email not verified, check your email account and spam filter for an activation link",
        "403"
      )
    );
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
      new HttpError("Verification token owner and user do not match!", "400")
    );
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let user;
  const { email } = req.body;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid email, please make sure email is valid", "422")
    );
  }
  try {
    user = await UserModel.findOne({ email });
    if (!user)
      return next(new HttpError("No user with that email exists", "401"));
    if (!user.verified)
      return next(new HttpError("User account email not verified", "403"));
  } catch (err) {
    console.log("error: " + err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  const createdToken = new TokenModel({
    creatorId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });

  const url = `${process.env.FE_URL}/reset/${user._id}/${createdToken.token}`;
  try {
    await createdToken.save();
    await sendEmail(
      user.email,
      "Password Reset Email",
      `<div style="font-weight: 400">A password reset was requested for the <a href="${process.env.FE_URL}">insta-sham</a> account associated with this email address.</div>
      <div style="font-weight: 400">If this was sent in error, please ignore this message.</div>
      <div style="font-weight: 900">However if not, please click the following link to confirm ownership of account: <a href="${url}">Click Here!</a></div>`
    );
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("A communication error occured, please try again.", "500")
    );
  }
  res.status(200).json({ message: "Password reset email sent!" });
}

export async function checkEmailRP(
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
    res.status(200).json({ message: "Please Enter Your New Password" });
  } else {
    return next(
      new HttpError("Verification token owner and user do not match!", "404")
    );
  }
}

export async function resetPass(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid email, please make sure email is valid", "422")
    );
  }
  const userId = req.params.uid;
  const sentToken = req.params.token;
  const { password } = req.body;
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
      const hashedPassword = await bcrypt.hash(password, 12);
      const tokenSession = await startSession();
      tokenSession.startTransaction();
      await UserModel.updateOne(
        {
          _id: user._id,
        },
        { password: hashedPassword }
      ).session(tokenSession);
      await token.remove({ session: tokenSession });
      await tokenSession.commitTransaction();
    } catch (err) {
      console.log(err);
      return next(
        new HttpError("A communication error occured, please try again.", "500")
      );
    }
    res.status(200).json({ message: "Password successfully changed!" });
  } else {
    return next(
      new HttpError("Verification token owner and user do not match!", "404")
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
