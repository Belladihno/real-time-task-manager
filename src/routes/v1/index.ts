import { Router } from "express";
import authRoutes from "@/routes/v1/auth";
import userRoutes from "@/routes/v1/user";
import projectRoutes from "@/routes/v1/project";
import workspaceRoutes from "@/routes/v1/workspace";
import taskRoutes from "@/routes/v1/task";
import subTaskRoutes from "@/routes/v1/sub.task";
import commentRoutes from "@/routes/v1/comment";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "API is live",
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/tasks", taskRoutes);
router.use("/sub-tasks", subTaskRoutes);
router.use("/comments", commentRoutes);

export default router;
