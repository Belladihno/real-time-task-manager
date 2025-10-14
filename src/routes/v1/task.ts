import { Router } from "express";
import protect from "@/middlewares/protect";
import { createTask } from "@/controllers/tasks/create.task";
import { getTaskById } from "@/controllers/tasks/get.task";
import { getTasks } from "@/controllers/tasks/get.tasks";
import { updateTask } from "@/controllers/tasks/update.task";
import { deleteTask } from "@/controllers/tasks/delete.task";
import { getSubTasks } from "@/controllers/sub-tasks/get.sub.tasks";
import { createSubTask } from "@/controllers/sub-tasks/create.sub.task";

const router = Router();

router.get("/", protect, getTasks);
router.get("/:taskId", protect, getTaskById);
router.post("/", protect, createTask);
router.patch("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);

router.get("/:taskId/subtasks", protect, getSubTasks);
router.post("/:taskId/subtasks", protect, createSubTask);

export default router;
