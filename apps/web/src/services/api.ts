export const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(body?.message ?? "Request failed.", response.status);
  }
  return (await response.json()) as T;
}
