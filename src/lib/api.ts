export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://resort-booking-1bou.onrender.com/api";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

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

  // If call to backend fails or is not ok, also try relative Next.js route if client-side
  if (typeof window !== "undefined" && !endpoint.startsWith("http")) {
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
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.error || `API request failed with status ${res.status}`);
}

export async function getSiteSettings(key = "site_config") {
  try {
    const res = await fetch(`${API_BASE_URL}/settings?key=${key}`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/settings?key=${key}`, { cache: "no-store" });
      if (res.ok) return await res.json();
    }
  }
  return null;
}

export async function saveSiteSettings(data: any, key = "site_config") {
  try {
    const res = await fetch(`${API_BASE_URL}/settings?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // continue to local API
  }

  const res = await fetch(`/api/settings?key=${key}`, {
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

export async function uploadLogoFile(fileDataOrUrl: { fileData?: string; url?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/logo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileDataOrUrl),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // continue to local API
  }

  const res = await fetch(`/api/settings/logo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fileDataOrUrl),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload logo");
  }
  return await res.json();
}
