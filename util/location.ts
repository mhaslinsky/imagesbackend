import axios from "axios";
import HttpError from "../models/http-error";
import "dotenv/config";

export default async function getCoordsFromAddress(address: any) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError(
      "Could not find the entered address on planet Earth. Please try a different address.",
      "422"
    );
  }
  const coordinates = data.results[0].geometry.location;

  return coordinates;
}
