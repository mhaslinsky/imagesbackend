import { Request } from "express";

export interface GetUserAuthHeader extends Request {
  userData?: any;
}
