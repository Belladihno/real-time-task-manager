import { createProject } from "@/controllers/project/create.project";
import { Router } from "express";
import protect from "@/middlewares/protect";
import { getProjectById } from "@/controllers/project/get.project";
import authorize from "@/middlewares/authorize";
import { deleteProject } from "@/controllers/project/delete.project";
import { updateProject } from "@/controllers/project/update.project";

const router = Router();

router.post("/", protect, createProject);
router.get("/:projectId", protect, getProjectById);
router.put("/:projectId", protect, updateProject);
router.delete(
  "/:projectId",
  protect,
  authorize(["admin", "user"]),
  deleteProject
);

export default router;
