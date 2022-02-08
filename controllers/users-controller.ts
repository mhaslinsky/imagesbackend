import { users } from "../DUMMY_USERS";
import { randomUUID } from "crypto";
import UserObj from "../models/userObj";
import HttpError from "../models/http-error";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function getUsers(req: any, res: any, next: any) {
  res.json({ users: users });
}

export function signUp(req: Request, res: Response, next: NextFunction) {
  const error = validationResult(req);
  console.log(error);
  if (!error.isEmpty()) {
    throw new HttpError(
      "Invalid account creation credentials, please make sure email is valid and password is at least 6 characters",
      "422"
    );
  }
  const { username, email, password } = req.body;
  const createdUser: UserObj = {
    id: randomUUID(),
    username,
    email,
    password,
  };
  const alreadyExists = users.find((u) => {
    return u.email === email;
  });
  if (alreadyExists) {
    const error: NodeJS.ErrnoException = new HttpError(
      "Could not create user, email already exists",
      "422"
    );
    throw error;
  }
  users.push(createdUser);
  res.status(201).json({ user: createdUser });
}

export function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  const idUser = users.find((u) => {
    return u.email === email;
  });
  console.log(idUser);

  if (!idUser) {
    const error: NodeJS.ErrnoException = new HttpError(
      "Could not find a user with that email",
      "401"
    );
    throw error;
  }
  if (idUser.password !== password) {
    const error: NodeJS.ErrnoException = new HttpError(
      "Incorrect Password",
      "401"
    );
    throw error;
  } else {
    res.json({ message: "Logged In" });
  }
}
