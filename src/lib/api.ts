const rawBase = (process.env.NEXT_PUBLIC_API_URL || "/api").trim().replace(/\/$/, "");
export const API_BASE_URL = rawBase.endsWith("/api")
  ? rawBase
  : rawBase.startsWith("http")
  ? `${rawBase}/api`
  : rawBase;

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${res.status}`);
  }

  return res.json();
}

export async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}
