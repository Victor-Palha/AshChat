import { Router } from "express";
import { createNewUserController } from "./controllers/create-new-user.controller";
import { authenticateUserController } from "./controllers/authenticate-user.controller";
import { confirmEmailCodeController } from "./controllers/confirm-email-code.controller";
import { changeUserPasswordController } from "./controllers/change-user-password.controller";

export const userRoutes = Router();

userRoutes
.post("/user/register", createNewUserController)
.post("/user/login", authenticateUserController)
.post("/user/confirme-email", confirmEmailCodeController)
.post("/user/change-password", changeUserPasswordController)

