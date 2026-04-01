export type SortParams = { sortBy: string; sortType: SORT_TYPE };

export type SearchParams = { keyword: string; field: string };

export type PaginateParams = { offset: number; limit: number };

export type TourFilterParams = {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  tourCategory?: string;
  duration_days?: number;
};

// export type TourFilterParams2 = {
//   { name: string; value: string }
// }
export type HotelFilterParams = {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
};

export type ProductFilterParams = {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  brand?: string;
  isFeatured?: boolean;
};

export enum SORT_TYPE {
  "DESC" = "desc",
  "ASC" = "asc",
}
