import axios from "axios";
import HttpError from "../models/http-error";
import "dotenv/config";

const API_KEY = "AIzaSyCwMb_QL_Ri1xqivjiHXP8ELR61ZCF-AJ4";

export default async function getCoordsFromAddress(address: any) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.API_KEY}`
  );

  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError(
      "Could not find coordinates for the specified address",
      "422"
    );
  }
  const coordinates = data.results[0].geometry.location;

  return coordinates;
}
