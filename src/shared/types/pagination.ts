// Shared by every paginated admin list endpoint (Applicants, Contestants,
// Messages, Users, ...) — mirrors the backend's buildPageMeta().
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
