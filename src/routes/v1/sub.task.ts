import { Router } from "express";
import protect from "@/middlewares/protect";
import { getSubTaskById } from "@/controllers/sub-tasks/get.sub.task";
import { updateSubTask } from "@/controllers/sub-tasks/update.sub.task";
import { deleteSubTask } from "@/controllers/sub-tasks/delete.sub.task";

const router = Router();

router.get("/:subTaskId", protect, getSubTaskById);
router.patch("/:subTaskId", protect, updateSubTask);
router.delete("/:subTaskId", protect, deleteSubTask);

export default router;
