import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeImageObject,
  resumeReview,
} from "../controllers/aiController.js";
import { singleUpload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-image", auth, generateImage);

aiRouter.post(
  "/remove-image-background",
  singleUpload("image"),
  auth,
  removeImageBackground
);
aiRouter.post(
  "/remove-image-object",
  singleUpload("image"),
  auth,
  removeImageObject
);
aiRouter.post("/resume-review", singleUpload("resume"), auth, resumeReview);

export default aiRouter;
