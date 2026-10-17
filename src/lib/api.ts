export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://resort-booking-1bou.onrender.com/api";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Try configured backend URL first
  try {
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
  } catch (backendErr) {
    // If backend at localhost:5000 is unreachable, try relative Next.js API route as fallback
    if (typeof window !== "undefined" && !endpoint.startsWith("http") && API_BASE_URL.includes("5000")) {
      try {
        const fallbackRes = await fetch(`/api${cleanEndpoint}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
        });
        if (fallbackRes.ok) {
          return await fallbackRes.json();
        }
      } catch (fallbackErr) {
        // Fallback also failed
      }
    }
    throw backendErr;
  }
}

export async function getSiteSettings(key = "site_config") {
  // First try API_BASE_URL
  try {
    const res = await fetch(`${API_BASE_URL}/settings?key=${key}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback to Next.js API
    try {
      const res = await fetch(`/api/settings?key=${key}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Failed to fetch settings from both sources", err);
    }
  }
  return null;
}

export async function saveSiteSettings(data: any, key = "site_config") {
  let saved = null;
  // Try API_BASE_URL
  try {
    const res = await fetch(`${API_BASE_URL}/settings?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) saved = await res.json();
  } catch (e) {
    // Fallback to Next.js API
  }

  if (!saved) {
    const res = await fetch(`/api/settings?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save settings");
    saved = await res.json();
  }

  return saved;
}

export async function uploadLogoFile(fileDataOrUrl: { fileData?: string; url?: string }) {
  let result = null;
  // Try API_BASE_URL
  try {
    const res = await fetch(`${API_BASE_URL}/settings/logo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileDataOrUrl),
    });
    if (res.ok) result = await res.json();
  } catch (e) {
    // Fallback
  }

  if (!result) {
    const res = await fetch(`/api/settings/logo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileDataOrUrl),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to upload logo");
    }
    result = await res.json();
  }

  return result;
}
