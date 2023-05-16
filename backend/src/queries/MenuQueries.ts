import { pool } from "../../db/db";
import { CreateMenuParams, Menu } from "../types/menu";

interface MenuQueries {
  createMenu: (createMenuParams: CreateMenuParams) => Promise<Menu>;
  getMenu: (menuId: string) => Promise<Menu | undefined>;
}

export const menuQueries: MenuQueries = {
  createMenu: async (createMenuParams) => {
    const { name, price, locationIds, assetUrl, description } =
      createMenuParams;
    const text =
      "INSERT INTO menus(name, price, asset_url, description) VALUES($1, $2,$3,$4) RETURNING *";
    const values = [name, price, assetUrl, description];
    const result = await pool.query(text, values);
    const menu = result.rows[0] as Menu;
    const menuId = menu.id as string;

    await pool.query(
      "INSERT INTO menus_locations (menus_id,locations_id) SELECT * FROM unnest($1::int[],$2::int[]) RETURNING *",
      [Array(locationIds.length).fill(menuId), locationIds]
    );

    return { id: menuId, name, price, locationIds };
  },

  getMenu: async (menuId) => {
    const menuResult = await pool.query(
      "SELECT * FROM menus where menus.id = $1",
      [menuId]
    );
    const hasMenu = menuResult.rows.length > 0;
    if (hasMenu) {
      const menu = menuResult.rows[0] as Menu;
      const menuLocationsResult = await pool.query(
        "SELECT locations_id FROM menus_locations where menus_id = $1",
        [menuId]
      );
      const locationIds = menuLocationsResult.rows[0];

      const menuMenuCategoriesResult = await pool.query(
        "SELECT menu_categories_id FROM menus_menu_categories where menus_id = $1",
        [menuId]
      );
      const menuCategoryIds = menuMenuCategoriesResult.rows[0];

      const menuAddonCategoriesResult = await pool.query(
        "SELECT addon_categories_id FROM menus_addon_categories where menus_id = $1",
        [menuId]
      );
      const addonCategoryIds = menuAddonCategoriesResult.rows[0];

      return {
        id: menuId,
        name: menu.name,
        price: menu.price,
        locationIds,
        menuCategoryIds,
        addonCategoryIds,
      };
    }
  },
};
