/** API 基础 URL — 开发时为空（走 Vite proxy），生产时指向 API 域名 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
