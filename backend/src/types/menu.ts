export interface Menu {
  id?: string;
  name: string;
  price: number;
  locationIds: string[];
  imageUrl?: string;
  menuCategoryIds?: string[];
  addonCategoryIds?: string[];
}

export interface CreateMenuParams {
  name: string;
  price: number;
  locationIds: string[];
  description: string;
  assetUrl?: string;
}
