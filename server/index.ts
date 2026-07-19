import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import Routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", Routes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
