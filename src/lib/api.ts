// Use local Next.js API routes by default for instant performance and zero cold starts.
// Only use external backend if explicitly provided in environment variables.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "https://resort-booking-1bou.onrender.com/api");

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // In the browser, always prioritize the fast, direct Next.js API route
  if (typeof window !== "undefined" && !endpoint.startsWith("http")) {
    try {
      const localRes = await fetch(`/api${cleanEndpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
      if (localRes.ok) {
        return await localRes.json();
      }
    } catch {
      // fallback to external URL if local failed
    }
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL || "/api"}${cleanEndpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.ok) {
    return await res.json();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.error || `API request failed with status ${res.status}`);
}

export async function getSiteSettings(key = "site_config") {
  // In browser, query direct relative Next.js route for instant response (no Render cold-start)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/settings?key=${key}`, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
  }

  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/settings?key=${key}` : `/api/settings?key=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }

  return null;
}

export async function saveSiteSettings(data: any, key = "site_config") {
  // Save directly to Next.js API route first for instant persistence
  try {
    const res = await fetch(`/api/settings?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      // Also sync to external backend asynchronously if configured
      if (API_BASE_URL && API_BASE_URL.startsWith("http")) {
        fetch(`${API_BASE_URL}/settings?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {});
      }
      return await res.json();
    }
  } catch (err: any) {
    console.warn("Failed saving via relative route:", err);
  }

  // Fallback to API_BASE_URL if relative route failed
  if (API_BASE_URL && API_BASE_URL.startsWith("http")) {
    const res = await fetch(`${API_BASE_URL}/settings?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to save settings");
    }
    return await res.json();
  }

  throw new Error("Unable to save settings at this time.");
}

export async function uploadLogoFile(fileDataOrUrl: { fileData?: string; url?: string }) {
  try {
    const res = await fetch(`/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileDataOrUrl),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // continue
  }

  if (API_BASE_URL && API_BASE_URL.startsWith("http")) {
    const res = await fetch(`${API_BASE_URL}/settings/logo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileDataOrUrl),
    });
    if (res.ok) return await res.json();
  }

  throw new Error("Failed to upload logo.");
}
