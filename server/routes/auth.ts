import express from "express";
import AuthController from "../controllers/authController";

const AuthRouter = express.Router();

AuthRouter.post("/register", AuthController.register);

export default AuthRouter;
