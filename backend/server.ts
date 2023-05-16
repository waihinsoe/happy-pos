import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import cors from "cors";

import { menuRouter } from "./src/routers/menuRouter";
import { menuCategoriesRouter } from "./src/routers/menuCategoriesRouter";
import { authRouter } from "./src/routers/authRouter";
import { appRouter } from "./src/routers/appRouter";
import { settingsRouter } from "./src/routers/settingsRouter";
import { locationsRouter } from "./src/routers/locationsRouter";
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use("/", appRouter);
app.use("/menus", menuRouter);
app.use("/menu-categories", menuCategoriesRouter);
app.use("/auth", authRouter);
app.use("/settings", settingsRouter);
app.use("/locations", locationsRouter);
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
