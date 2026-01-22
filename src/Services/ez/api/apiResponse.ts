export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  payload: T;
  timestamp: string;
}

// Extracts the payload from a wrapped API response. Simple implementation.
export function unwrapResponse<T>(response: { data: ApiResponse<T> }): T {
  return response.data.payload;
}
