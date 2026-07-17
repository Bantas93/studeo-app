import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import AuthRouter from "./routes/auth";
import UserRouter from "./routes/users";

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(AuthRouter);

app.use("/users", UserRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
