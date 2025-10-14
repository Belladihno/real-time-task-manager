import { Router } from "express";
import protect from "@/middlewares/protect";
import { createWorkspace } from "@/controllers/workspace/create.workspace";
import { getWorkspaces } from "@/controllers/workspace/get.workspaces";
import { updateWorkspace } from "@/controllers/workspace/update.workspace";
import { getWorkspaceById } from "@/controllers/workspace/get.workpace";
import { deleteWorkspace } from "@/controllers/workspace/delete.workspace";
import { addMemberToWorkspace } from "@/controllers/workspace/add.member";
import { updateWorkspaceMember } from "@/controllers/workspace/update.member";
import { removeWorkspaceMember } from "@/controllers/workspace/remove.member";
import { reactivateWorkspaceMember } from "@/controllers/workspace/reactivate.member";
import { getWorkspaceMembers } from "@/controllers/workspace/get.members";

const router = Router();

router.get("/:workspaceId", protect, getWorkspaceById);
router.get("/", protect, getWorkspaces);
router.get("/:workspaceId/members", protect, getWorkspaceMembers);
router.post("/", protect, createWorkspace);
router.post("/:workspaceId/members", protect, addMemberToWorkspace);
router.post(
  "/:workspaceId/members/:memberId/reactivate",
  protect,
  reactivateWorkspaceMember
);
router.patch("/:workspaceId", protect, updateWorkspace);
router.patch("/:workspaceId/members/:memberId", protect, updateWorkspaceMember);
router.delete("/:workspaceId", protect, deleteWorkspace);
router.delete(
  "/:workspaceId/members/:memberId",
  protect,
  removeWorkspaceMember
);

export default router;
