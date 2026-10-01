export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationParams = (
  pageQuery?: any,
  limitQuery?: any
): PaginationParams => {
  const page = Math.max(1, parseInt(String(pageQuery || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(limitQuery || 20), 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
