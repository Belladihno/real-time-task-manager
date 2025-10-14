import { createProject } from "@/controllers/project/create.project";
import { Router } from "express";
import protect from "@/middlewares/protect";
import { getProjectById } from "@/controllers/project/get.project";
import { deleteProject } from "@/controllers/project/delete.project";
import { updateProject } from "@/controllers/project/update.project";
import { getProjects } from "@/controllers/project/get.projects";
import { addMemberToProject } from "@/controllers/project/add.member";
import { updateProjectMember } from "@/controllers/project/update.member";
import { removeProjectMember } from "@/controllers/project/remove.member";
import { reactivateProjectMember } from "@/controllers/project/reactivate.member";
import { getProjectMembers } from "@/controllers/project/get.members";

const router = Router();

router.get("/", protect, getProjects);
router.get("/:projectId", protect, getProjectById);
router.get("/:projectId/members", protect, getProjectMembers);
router.post("/", protect, createProject);
router.post(
  "/:projectId/members/:memberId/reactivate",
  protect,
  reactivateProjectMember
);
router.post("/:projectId/members", protect, addMemberToProject);
router.patch("/:projectId", protect, updateProject);
router.patch("/:projectId/members/:memberId", protect, updateProjectMember);
router.delete("/:projectId", protect, deleteProject);
router.delete("/:projectId/members/:memberId", protect, removeProjectMember);

export default router;
