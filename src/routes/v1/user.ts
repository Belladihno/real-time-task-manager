import { Router } from "express";
import { getProfile } from "@/controllers/users/get.profile";
import protect from "@/middlewares/protect";
import authorize from "@/middlewares/authorize";
import { updateProfile } from "@/controllers/users/update.profile";
import { changePassword } from "@/controllers/users/change.password";
import { getUsers } from "@/controllers/users/get.users";
import { getUserById } from "@/controllers/users/get.user";

const router = Router();

router.get("/profile", protect, authorize(["admin", "user"]), getProfile);
router.put("/profile", protect, authorize(["admin", "user"]), updateProfile);
router.put("/password", protect, changePassword);
router.get("/", protect, authorize(["admin"]), getUsers);
router.get("/:userId", protect, authorize(["admin"]), getUserById);

export default router;
