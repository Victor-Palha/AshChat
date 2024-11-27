import { Router } from "express";
import { createNewUserController } from "./controllers/create-new-user.controller";
import { authenticateUserController } from "./controllers/authenticate-user.controller";
import { confirmEmailCodeController } from "./controllers/confirm-email-code.controller";
import { changeUserPasswordController } from "./controllers/change-user-password.controller";
import { confirmChangeUserPasswordController } from "./controllers/confirm-change-user-password.controller";
import { temporaryJwtMiddleware } from "./middlewares/temporaty-jwt.middleware";
import { confirmNewDeviceController } from "./controllers/confirm-new-device.controller";

export const userRoutes = Router();

userRoutes
.post("/user/register", createNewUserController)
.post("/user/login", authenticateUserController)
.post("/user/confirm-email", confirmEmailCodeController)
.post("/user/change-password", changeUserPasswordController)
.patch("/user/confirm-change-password", temporaryJwtMiddleware, confirmChangeUserPasswordController)
.patch("/user/confirm-new-device", temporaryJwtMiddleware, confirmNewDeviceController);

