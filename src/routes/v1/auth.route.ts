import { Router } from "express";
import { refreshToken } from "@/controllers/auth/refresh.token";
import { register } from "@/controllers/auth/register";
import { login } from "@/controllers/auth/login";
import { logout } from "@/controllers/auth/logout";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
