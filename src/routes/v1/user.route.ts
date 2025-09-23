import { Router } from "express";
import { getUser } from "@/controllers/users/get.user";
import protect from "@/middlewares/protect";
import authorize from "@/middlewares/authorize";
import { updateUser } from "@/controllers/users/update.user";
import { changePassword } from "@/controllers/users/change.password";
import { getAllUsers } from "@/controllers/users/get.all.users";
import { getUserById } from "@/controllers/users/get.user.byId";

const router = Router();

router.get("/get-user", protect, authorize(["admin", "user"]), getUser);
router.put("/update-user", protect, authorize(["admin", "user"]), updateUser);
router.put("/change-password", protect, changePassword);
router.get("/get-all-users", protect, authorize(["admin"]), getAllUsers);
router.get("/:userId", protect, authorize(["admin"]), getUserById);

export default router;
