import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import Routes from "./routes";

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", Routes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
