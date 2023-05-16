import express, { Request, Response } from "express";
import { pool } from "../db/db";
import { checkAuth } from "../auth/auth";
export const settingsRouter = express.Router();

settingsRouter.put(
  "/companies/:companyId",
  checkAuth,
  async (req: Request, res: Response) => {
    const companyId = req.params.companyId;
    const { name, address } = req.body;
    if (!companyId || !name || !address) return res.sendStatus(400);
    const companyResult = await pool.query(
      "update companies set name = $1, address = $2 where id = $3",
      [name, address, companyId]
    );
    res.send(companyResult.rows[0]);
  }
);
