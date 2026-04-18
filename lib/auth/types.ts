/** Public user fields returned from `/api/auth/me` (Strapi users-permissions). */
export type AuthUser = {
  id: number;
  username: string;
  email: string;
};
