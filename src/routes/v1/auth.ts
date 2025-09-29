import { Router } from "express";
import { refreshToken } from "@/controllers/auth/refresh.token";
import { register } from "@/controllers/auth/register";
import { login } from "@/controllers/auth/login";
import { logout } from "@/controllers/auth/logout";
import { forgotPassword } from "@/controllers/auth/forgot.password";
import { verifyResetToken } from "@/controllers/auth/verify.reset.token";
import { resetPassword } from "@/controllers/auth/reset.password";
import { accountVerification } from "@/controllers/auth/account.verification";
import protect from "@/middlewares/protect";
import { verifyToken } from "@/controllers/auth/verify.token";
import { verifyAccount } from "@/controllers/auth/verify.account";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.patch("/forgot-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken);
router.patch("/reset-password/:token", resetPassword);
router.patch("/account-verification", protect, accountVerification);
router.get("/verify-account/:token", verifyToken);
router.patch("/verify-account/:token", verifyAccount);

export default router;
