// Set VITE_API_URL / VITE_SOCKET_URL in a .env file for local dev,
// or in your Vercel project's Environment Variables for production.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;
