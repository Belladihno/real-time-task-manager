import { Router } from "express";
import protect from "@/middlewares/protect";
import { createWorkspace } from "@/controllers/workspace/create.workspace";
import { getWorkspaces } from "@/controllers/workspace/get.workspaces";
import { updateWorkspace } from "@/controllers/workspace/update.workspace";
import { getWorkspaceById } from "@/controllers/workspace/get.workpace";
import { deleteWorkspace } from "@/controllers/workspace/delete.workspace";

const router = Router();

router.post("/", protect, createWorkspace);
router.get("/:workspaceId", protect, getWorkspaceById);
router.get("/", protect, getWorkspaces);
router.put("/:workspaceId", protect, updateWorkspace);
router.delete("/:workspaceId", protect, deleteWorkspace);

export default router;
