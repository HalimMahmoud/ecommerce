/**
 * Base URL for server-side calls to Strapi.
 * Use `STRAPI_INTERNAL_URL` when Next.js runs in Docker and `localhost:1337` is wrong (e.g. `http://host.docker.internal:1337`).
 */
export function strapiBaseUrl(): string {
  const raw =
    process.env.STRAPI_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    process.env.STRAPI_URL ??
    'http://localhost:1337';


  return raw.replace(/\/$/, '');
}
