import express, { Request, Response } from "express";
import UserController from "../controllers/userController";
const UserRouter = express.Router();

UserRouter.get("/");

UserRouter.get("/users", UserController.getUsers);

export default UserRouter;
