import { createComment } from "@/controllers/comments/create.comment";
import { deleteComment } from "@/controllers/comments/delete.comment";
import { getComments } from "@/controllers/comments/get.comments";
import { updateComment } from "@/controllers/comments/update.comment";
import protect from "@/middlewares/protect";
import { Router } from "express";

const router = Router();

router.post("/", protect, createComment);
router.get("/", protect, getComments);
router.patch("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);

export default router;
