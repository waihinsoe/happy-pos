import express, { Request, Response } from "express";
import { checkAuth } from "../auth/auth";
import { pool } from "../../db/db";
import { User } from "../types/user";
import { fileUpload } from "../utils/fileUpload";
export const appRouter = express.Router();

appRouter.get("/", checkAuth, async (req: Request, res: Response) => {
  //@ts-ignore
  const userResult = await pool.query("SELECT * FROM users where email=$1", [
    //@ts-ignore
    req.email,
  ]);
  const userRows = userResult.rows;

  if (!userRows.length) return res.sendStatus(401);
  const user: User = userResult.rows[0];
  const companyId = user.companies_id;
  const company = await pool.query("SELECT * FROM companies WHERE id=$1", [
    companyId,
  ]);
  const locations = await pool.query(
    "SELECT * FROM locations where companies_id=$1 ",
    [companyId]
  );

  const locationIds = locations.rows.map((row) => row.id);

  const menuLocations = await pool.query(
    "SELECT * FROM menus_locations where locations_id = ANY($1::int[])",
    [locationIds]
  );

  const menuIds = menuLocations.rows.map((row) => row.menus_id);
  const menus = await pool.query(
    "SELECT * FROM menus WHERE id= ANY($1::int[])",
    [menuIds]
  );

  const menusMenuCategoriesResult = await pool.query(
    "SELECT * FROM menus_menu_categories WHERE menus_id = ANY($1::int[])",
    [menuIds]
  );

  const menuCategoryIds = menusMenuCategoriesResult.rows.map(
    (row) => row.menu_categories_id
  );
  const menuCategories = await pool.query(
    "SELECT * FROM menu_categories WHERE id = ANY($1::int[])",
    [menuCategoryIds]
  );

  const menusAddonCategories = await pool.query(
    "SELECT * FROM menus_addon_categories WHERE menus_id= ANY($1::int[])",
    [menuIds]
  );

  const addonCategoryIds = menusAddonCategories.rows.map(
    (row) => row.addon_categories_id
  );

  const addonCategories = await pool.query(
    "SELECT * FROM addon_categories WHERE id=ANY($1::int[])",
    [addonCategoryIds]
  );

  const addons = await pool.query(
    "SELECT * FROM addons WHERE addon_categories_id=ANY($1::int[])",
    [addonCategoryIds]
  );

  res.send({
    menus: menus.rows,
    menuCategories: menuCategories.rows,
    addons: addons.rows,
    addonCategories: addonCategories.rows,
    locations: locations.rows,
    menusLocations: menuLocations.rows,
    company: company.rows[0],
  });
});

appRouter.post("/assets", (req: Request, res: Response) => {
  try {
    fileUpload(req, res, (error) => {
      if (error) {
        return res.sendStatus(500);
      }
      const files = req.files as Express.MulterS3.File[];
      const file = files[0];
      const assetUrl = file.location;
      return res.send({ assetUrl });
    });
  } catch (error) {
    return res.sendStatus(500);
  }
});
