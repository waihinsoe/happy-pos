import express, { Request, Response } from "express";
import { pool } from "../../db/db";
import { checkAuth } from "../auth/auth";
export const locationsRouter = express.Router();

locationsRouter.post(
  "/:companyId",
  checkAuth,
  async (req: Request, res: Response) => {
    const companyId = req.params.companyId;
    console.log(companyId);
    const { name, address } = req.body;
    if (!name || !address || !companyId) return res.sendStatus(400);
    const locationsResult = await pool.query(
      "INSERT INTO locations (name,address,companies_id) VALUES($1,$2,$3) RETURNING *",
      [name, address, companyId]
    );
    res.send(locationsResult.rows);
  }
);

locationsRouter.delete(
  "/:locationId",
  checkAuth,
  async (req: Request, res: Response) => {
    const locationId = req.params.locationId;
    if (!locationId) return res.sendStatus(400);

    try {
      await pool.query("DELETE FROM locations WHERE id=$1", [locationId]);
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  }
);

locationsRouter.put("/", checkAuth, async (req: Request, res: Response) => {
  const { id, name, address } = req.body;
  if (!id || !name || !address) return res.sendStatus(400);
  try {
    const locationResult = await pool.query(
      "UPDATE locations SET name=$1,address=$2 where id=$3 RETURNING *",
      [name, address, id]
    );

    return res.send(locationResult.rows[0]);
  } catch (error) {
    res.sendStatus(500);
  }
});
