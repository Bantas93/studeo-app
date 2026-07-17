import express, { Request, Response } from "express";
import UserRouter from "./users";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("This is the studeo db!");
});

router.use("/users", UserRouter);

export default router;
