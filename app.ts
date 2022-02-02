import express from "express";
import bodyParser from "body-parser";
import placesRouter from "./routes/places-routes";
import { RequestHandler } from "express";

// const placesRoutes = require("./routes/places-routes");
const app = express();

app.use("/api/places", placesRouter); //for /api/places

app.use((error: NodeJS.ErrnoException, req: any, res: any, next: any) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});

app.listen(5000);
