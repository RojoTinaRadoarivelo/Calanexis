export const MAX_LIMIT_SIZE = 12;
export const getPageIndex = (page?: number): number => page ?? 0;
export const getLimitSize = (page?: number, limit: number = MAX_LIMIT_SIZE) =>
  page ? limit * (page - 1) : 0;
