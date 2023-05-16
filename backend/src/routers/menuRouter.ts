import express, { Request, Response } from "express";
import { checkAuth } from "../auth/auth";
import { pool } from "../../db/db";
import { menuQueries } from "../queries/MenuQueries";
import { fileUpload } from "../utils/fileUpload";
import { config } from "../config/config";
export const menuRouter = express.Router();

menuRouter.get("/", async (req: Request, res: Response) => {
  const result = await pool.query("select * from menus");
  res.send(result.rows);
});

menuRouter.post("/", checkAuth, async (req: Request, res: Response) => {
  const { name, price, description, locationIds, assetUrl } = req.body;
  const isValid = name && locationIds && locationIds.length;
  if (!isValid) return res.sendStatus(400);
  const menu = await menuQueries.createMenu({
    name,
    price,
    locationIds,
    description,
    assetUrl,
  });
  res.send(menu);
});

menuRouter.delete(
  "/:menuId",
  checkAuth,
  async (req: Request, res: Response) => {
    const { menuId } = req.params;
    if (!menuId) return res.send({ message: "error" });
    const text = "DELETE FROM menus WHERE menus.id=$1 RETURNING *";
    const values = [menuId];
    const deletedValue = await pool.query(text, values);
    res.send(deletedValue);
  }
);

menuRouter.put("/:menuId", checkAuth, async (req: Request, res: Response) => {
  const { menuId } = req.params;
  if (!menuId) return res.send({ message: "menu id is required" });
  const { name, price } = req.body;
  if (!name || !price)
    return res.send("Please provide at least name or price.");
  const text =
    "UPDATE menus SET name=$1,price=$2 WHERE menus.id=$3 RETURNING *";
  const values = [name, price, menuId];
  const updateValue = await pool.query(text, values);
  res.send(updateValue);
});
