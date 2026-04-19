export interface CategoryListItem {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  icon: string | null;
}

export interface RandomCategoriesResponse {
  categories: CategoryListItem[];
}
