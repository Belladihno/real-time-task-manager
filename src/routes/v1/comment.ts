import { createComment } from "@/controllers/comments/create.comment";
import { getComments } from "@/controllers/comments/get.comments";
import protect from "@/middlewares/protect";
import { Router } from "express";

const router = Router();

router.post("/", protect, createComment);
router.get("/", protect, getComments);

export default router;
