// Standard API response format: { success, message, data }
export const ok = <T>(data: T, message = 'Request successful') => ({
  success: true,
  message,
  data,
});

export const paginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => ({
  success: true,
  message: 'Request successful',
  data,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});
