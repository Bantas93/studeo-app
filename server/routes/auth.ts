import express, { Request, Response } from "express";
import AuthController from "../controllers/authController";
const AuthRouter = express.Router();

AuthRouter.get("/");

AuthRouter.get("/register", AuthController.register);

export default AuthRouter;
