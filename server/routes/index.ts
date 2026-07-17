import express from "express";
import AuthRouter from "./auth";
import UserRouter from "./users";

const router = express.Router();

router.use("/", AuthRouter);
router.use("/users", UserRouter);

export default router;
