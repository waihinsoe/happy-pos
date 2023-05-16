import express, { Request, Response } from "express";
import { pool } from "../../db/db";
import bcrypt from "bcrypt";
import { config } from "../config/config";
import jwt from "jsonwebtoken";
export const authRouter = express.Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const isValid = email && email.length > 0 && password && password.length > 0;
  if (!isValid) return res.sendStatus(400);

  const result = await pool.query("select * from users where email=$1", [
    email,
  ]);

  if (!result.rows.length) return res.sendStatus(404);

  const isValidPassword = await bcrypt.compare(
    password,
    result.rows[0].password
  );

  if (!isValidPassword) return res.sendStatus(401).send("wrong credentials.");

  const userResult = result.rows[0];
  const user = {
    id: userResult.id,
    name: userResult.name,
    email: userResult.email,
  };
  const accessToken = jwt.sign(user, config.jwtSecret);

  res.send({ accessToken });
});

authRouter.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const isValid =
    name &&
    name.length > 0 &&
    email &&
    email.length > 0 &&
    password &&
    password.length > 0;
  if (!isValid) return res.sendStatus(400).send({ error: "fill all input" });

  const result = await pool.query("select * from users where email=$1", [
    email,
  ]);
  if (result.rows.length) return res.send({ message: "User alreadys exists." });

  const hashedPassword = await bcrypt.hash(password, 10);

  const companiesResult = await pool.query(
    "INSERT INTO companies (name) VALUES($1) RETURNING *",
    ["default company"]
  );
  const companyId = companiesResult.rows[0].id;

  const newUser = await pool.query(
    "INSERT INTO users (name,email,password,companies_id ) VALUES($1,$2,$3,$4) RETURNING *",
    [name, email, hashedPassword, companyId]
  );

  const locationResult = await pool.query(
    "INSERT INTO locations (name,address,companies_id) VALUES($1,$2,$3) RETURNING * ",
    ["default Location", "default address", companyId]
  );

  const locationId = locationResult.rows[0].id;

  const menuResult = await pool.query(
    "INSERT INTO menus (name,price) SELECT * FROM unnest($1::text[],$2::int[]) RETURNING * ",
    [
      ["mote-hinn-khar", "nan-gyi-toke"],
      [500, 600],
    ]
  );

  const menus = menuResult.rows;
  const defaultMenuId1 = menus[0].id;
  const defaultMenuId2 = menus[1].id;

  await pool.query(
    "INSERT INTO menus_locations (menus_id,locations_id,is_available) select * from unnest($1::int[], $2::int[], $3::boolean[]) RETURNING *",
    [
      [defaultMenuId1, defaultMenuId2],
      [locationId, locationId],
      [true, true],
    ]
  );

  const menuCategoriesResult = await pool.query(
    "INSERT INTO menu_categories (name) VALUES('defaultMenuCategory1'),('defaultMenuCategory2') RETURNING *"
  );

  const menu_categories = menuCategoriesResult.rows;
  const defaultMenuCategoryId1 = menu_categories[0].id;
  const defaultMenuCategoryId2 = menu_categories[1].id;

  await pool.query(
    `INSERT INTO menus_menu_categories (menus_id, menu_categories_id) VALUES(${defaultMenuId1},${defaultMenuCategoryId1}), (${defaultMenuId2},${defaultMenuCategoryId2}) RETURNING *`
  );

  const addonCategoriesResult = await pool.query(
    "INSERT INTO addon_categories (name,is_required) VALUES('drink','false'),('size', 'true') RETURNING *"
  );

  const addonCategories = addonCategoriesResult.rows;
  const defaultAddonCategoryId1 = addonCategories[0].id;
  const defaultAddonCategoryId2 = addonCategories[1].id;

  await pool.query(
    `INSERT INTO menus_addon_categories (menus_id, addon_categories_id) VALUES(${defaultMenuId1},${defaultAddonCategoryId1}), (${defaultMenuId2}, ${defaultAddonCategoryId2}) RETURNING *`
  );

  await pool.query(
    `INSERT INTO addons (name,price,addon_categories_id) VALUES('cola',300,${defaultAddonCategoryId1}), ('pepsi',400,${defaultAddonCategoryId1}),('normal',0,${defaultAddonCategoryId2}),('large',300,${defaultAddonCategoryId2}) RETURNING *`
  );

  res.send(newUser.rows);
});
