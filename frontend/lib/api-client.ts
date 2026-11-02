/**
 * Centralized API Client & Error Abstraction
 * Yeh file saare HTTP requests handle karti hai — base URL resolve karna,
 * JSON parse karna, aur errors ko ek jagah manage karna.
 */

/**
 * API_BASE_URL — backend ka base URL dynamically decide hota hai:
 * - Browser mein ho toh relative path "/api/v1" use karo (Next.js proxy kar dega)
 * - Server-side rendering (SSR) mein ho toh full URL use karo env variable se
 */
const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/v1"  // Browser: relative path → Next.js proxy ke through jaayega
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"; // SSR: poora URL

/**
 * getRootServerUrl — server ka root URL return karta hai.
 * Yeh /health jaise endpoints ke liye use hota hai jo /api/v1 ke bahar hote hain.
 * - Browser mein: empty string (relative path use karo)
 * - SSR mein: env variable se protocol + host nikalke return karo
 */
const getRootServerUrl = (): string => {
  if (typeof window !== "undefined") return ""; // Browser mein relative path hi kaafi hai

  try {
    // NEXT_PUBLIC_API_URL se sirf protocol aur host nikalo (path hata do)
    const url = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1");
    return `${url.protocol}//${url.host}`;
  } catch {
    // URL parse karne mein error aaye toh fallback default use karo
    return "http://localhost:8000";
  }
};

/**
 * ApiError — custom error class hai jo API se aane wali errors ko represent karta hai.
 * Normal Error se zyada info deta hai: HTTP status code, error code, aur details.
 *
 * @param status  - HTTP status code (jaise 400, 401, 500)
 * @param code    - Backend ka error code string (jaise "NOT_FOUND")
 * @param message - Human-readable error message
 * @param details - Extra details (optional), backend se aaye koi bhi data
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);          // Parent Error class ko message do
    this.name = "ApiError"; // Error ka naam set karo identify karne ke liye
    this.status = status;   // HTTP status store karo
    this.code = code;       // Backend error code store karo
    this.details = details; // Extra details (optional)
  }
}

/**
 * fetchApi — yeh generic function hai jo saare API calls ke liye kaam aata hai.
 * Automatically headers add karta hai, response parse karta hai,
 * aur errors ko ApiError format mein throw karta hai.
 *
 * @param endpoint - API ka path (jaise "/users/me" ya full URL)
 * @param options  - Fetch ke additional options (method, body, headers, etc.)
 * @returns Promise<T> — expected response type mein data return karta hai
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Agar endpoint already full URL hai toh as-is use karo, warna base URL ke saath join karo
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Har request ke saath yeh default headers automatically jaate hain
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",       // Hum JSON bhej rahe hain
    Accept: "application/json",               // Hum JSON expect kar rahe hain
    "X-Requested-With": "XMLHttpRequest",     // CSRF protection ke liye
  };

  try {
    // Actual HTTP request — credentials: "include" matlab cookies bhi saath jaayenge
    const response = await fetch(url, {
      credentials: "include",  // Session cookies automatically attach honge
      ...options,               // Caller ke options override kar sakte hain defaults ko
      headers: {
        ...defaultHeaders,      // Pehle defaults
        ...options.headers,     // Phir caller ke custom headers (override ho sakte hain)
      },
    });

    // Agar response OK nahi hai (status 2xx nahi) toh error throw karo
    if (!response.ok) {
      let code = "UNKNOWN_ERROR";
      let message = `Request failed with status ${response.status}`;
      let details = null;

      try {
        // Backend ne JSON error response bheja hai — ussse code, message, details nikalo
        const errorData = await response.json();
        if (errorData?.error) {
          code = errorData.error.code || code;
          message = errorData.error.message || message;
          details = errorData.error.details || null;
        }
      } catch {
        // Agar error body JSON nahi tha toh default values rakhte hain — koi dikkat nahi
      }

      // Structured ApiError throw karo taaki caller easily handle kar sake
      throw new ApiError(response.status, code, message, details);
    }

    // Successful response ko JSON parse karke return karo
    return await response.json();
  } catch (error) {
    // Agar already ApiError hai toh dobara wrap mat karo — seedha throw karo
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error ya backend unreachable — generic 500 error throw karo
    throw new ApiError(
      500,
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network error / Backend unreachable"
    );
  }
}

/**
 * checkBackendHealth — backend server online hai ya nahi, yeh check karta hai.
 * /health endpoint ko ping karta hai aur status return karta hai.
 *
 * @returns { online: boolean, statusText: string }
 *   - online: true agar backend chal raha hai
 *   - statusText: backend ka status ya error description
 */
export async function checkBackendHealth(): Promise<{
  online: boolean;
  statusText: string;
}> {
  try {
    const rootUrl = getRootServerUrl(); // Server ka root URL lo

    // /health endpoint hit karo — cache disable karo taaki fresh response mile
    const response = await fetch(`${rootUrl}/health`, { cache: "no-store" });

    if (response.ok) {
      const data = await response.json();
      // Backend ne "ok" status diya toh online hai
      return { online: data?.status === "ok", statusText: data?.status || "ok" };
    }

    // Response aaya lekin OK nahi — HTTP status code ke saath return karo
    return { online: false, statusText: `HTTP ${response.status}` };
  } catch {
    // Network error — backend tak pahuncha hi nahi
    return { online: false, statusText: "Offline / Disconnected" };
  }
}

/**
 * apiClient — yeh ek convenient object hai jisme saare HTTP methods hain.
 * fetchApi ko directly call karne ki jagah yeh use karo — cleaner lagta hai.
 *
 * Usage examples:
 *   apiClient.get<User>("/users/me")
 *   apiClient.post<LoginResponse>("/auth/login", { email, password })
 *   apiClient.delete("/posts/123")
 */
export const apiClient = {
  // GET request — sirf data fetch karna, koi body nahi
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { method: "GET", ...options }),

  // POST request — naya data create karne ke liye, body JSON mein jaati hai
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined, // Body ho toh stringify karo
      ...options,
    }),

  // PUT request — poora resource replace karne ke liye
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  // PATCH request — resource ka sirf kuch part update karne ke liye
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  // DELETE request — koi resource delete karne ke liye, body nahi chahiye
  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { method: "DELETE", ...options }),
};
