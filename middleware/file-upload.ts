import multer from "multer";
import multerS3 from "multer-s3";
import { randomUUID } from "crypto";
import aws from "aws-sdk";
import HttpError from "../models/http-error";

//helps multer figure out what type of file we are working with.
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

type MimeKey = keyof typeof MIME_TYPE_MAP;

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION,
});

const fileUpload = multer({
  storage: multerS3({
    s3,
    bucket: "insta-sham",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      //converts left side of map sent to right side, getting proper extension
      const extension = MIME_TYPE_MAP[file.mimetype as MimeKey];
      cb(null, randomUUID() + "." + extension);
    },
  }),
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    let isValid = !!MIME_TYPE_MAP[file.mimetype as MimeKey];
    let error: Error | null = isValid
      ? null
      : new HttpError("Invalid Filetype", "422");
    if (error) {
      cb(error);
    } else {
      cb(null, isValid);
    }
  },
});

export default fileUpload;
