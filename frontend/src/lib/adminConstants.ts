export const ADMIN_PATH =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PATH
    ? String(import.meta.env.VITE_ADMIN_PATH)
    : 'admin-portal'
