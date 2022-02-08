import express from "express";
import {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  editPlace,
  deletePlace,
} from "../controllers/places-controller";
import { check } from "express-validator";
const placesRouter = express.Router();

const createPlaceValidation = [
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty(),
];

const updatePlaceValidation = [
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty(),
];

placesRouter.get("/:pid", getPlaceById);
placesRouter.get("/user/:uid", getPlacesByUserId);
placesRouter.patch("/:pid", updatePlaceValidation, editPlace);
placesRouter.delete("/:pid", deletePlace);
placesRouter.post("/", createPlaceValidation, createPlace);

export default placesRouter;
