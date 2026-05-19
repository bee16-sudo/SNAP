export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  icon_name: string | null;
  sort_order: number;
  children?: Category[];
}
