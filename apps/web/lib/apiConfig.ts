const ENV_API_URL = (process.env.NEXT_PUBLIC_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

let cachedWorkingBase: string | null = null;

export function getCandidateApiBases(): string[] {
  const ordered = [
    cachedWorkingBase !== null ? cachedWorkingBase : undefined,
    ENV_API_URL || undefined,
    "", // Same-origin Next.js proxy rewrite (/api/*)
    "http://localhost:3000",
  ].filter((v): v is string => v !== undefined);

  return Array.from(new Set(ordered));
}

export function getActiveDirectBackendUrl(): string | null {
  if (cachedWorkingBase && /^https?:\/\//i.test(cachedWorkingBase)) {
    return cachedWorkingBase;
  }
  if (ENV_API_URL && /^https?:\/\//i.test(ENV_API_URL)) {
    return ENV_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:3000";
  }
  return null;
}

export function getWebSocketEndpoint(baseUrl: string): string | null {
  if (!/^https?:\/\//i.test(baseUrl)) return null;
  const wsBase = baseUrl.replace(/^http/i, "ws").replace(/\/+$/, "");
  return `${wsBase}/api/telemetry/ws`;
}

export interface BackendFetchResult<T> {
  reached: boolean;
  ok: boolean;
  status: number;
  data: T | null;
  base: string;
}

export async function fetchFromBackend<T = unknown>(
  path: string,
  init: RequestInit = {},
  timeoutMs: number = 4000
): Promise<BackendFetchResult<T>> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const bases = getCandidateApiBases();

  for (const base of bases) {
    try {
      const res = await fetch(`${base}${normalizedPath}`, {
        ...init,
        cache: "no-store",
        signal: init.signal || AbortSignal.timeout(timeoutMs),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? ((await res.json()) as T)
        : null;

      if (res.ok) {
        cachedWorkingBase = base;
        return {
          reached: true,
          ok: true,
          status: res.status,
          data,
          base,
        };
      }

      // Stop probing on client validation/safety responses (400, 404 from real API, 422)
      if (res.status >= 400 && res.status < 500 && data !== null) {
        cachedWorkingBase = base;
        return {
          reached: true,
          ok: false,
          status: res.status,
          data,
          base,
        };
      }
    } catch {
      if (cachedWorkingBase === base) {
        cachedWorkingBase = null;
      }
    }
  }

  return {
    reached: false,
    ok: false,
    status: 0,
    data: null,
    base: "",
  };
}

