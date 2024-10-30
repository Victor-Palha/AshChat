import { Router } from "express";
import { createNewUserController } from "./controllers/create-new-user.controller";
import { authenticateUserController } from "./controllers/authenticate-user.controller";

export const userRoutes = Router();

userRoutes
.post("/user/register", createNewUserController)
.post("/user/login", authenticateUserController) // This should be authenticateUserController

