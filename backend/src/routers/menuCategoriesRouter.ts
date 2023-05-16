import { pool } from "../../db/db";
import { checkAuth } from "../auth/auth";
import express, { Request, Response } from "express";
export const menuCategoriesRouter = express.Router();

menuCategoriesRouter.post(
  "/",
  checkAuth,
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const text = "INSERT INTO menu_categories (name) VALUES($1) RETURNING *";
    const values = [name];
    const result = await pool.query(text, values);
    res.send({ menuCategory: result.rows });
  }
);

menuCategoriesRouter.delete(
  "/:menuCategoryId",
  checkAuth,
  async (req: Request, res: Response) => {
    const { menuCategoryId } = req.params;
    if (!menuCategoryId) return res.send({ message: "error" });
    const text =
      "DELETE FROM menu_categories WHERE menu_categories.id=$1 RETURNING *";
    const values = [menuCategoryId];
    const deletedValue = await pool.query(text, values);
    res.send(deletedValue);
  }
);

menuCategoriesRouter.put(
  "/:menuCategoryId",
  checkAuth,
  async (req: Request, res: Response) => {
    const { menuCategoryId } = req.params;
    if (!menuCategoryId) return res.send({ message: "menu id is required" });
    const { name } = req.body;
    if (!name) return res.send("Please provide at least name or price.");
    const text =
      "UPDATE menu_categories SET name=$1 WHERE menu_categories.id=$2 RETURNING *";
    const values = [name, menuCategoryId];
    const updateValue = await pool.query(text, values);
    res.send(updateValue);
  }
);
