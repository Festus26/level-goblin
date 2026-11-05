/** The only place the site name lives, so a rename is a one-line change. */
export const SITE_NAME = 'Level Goblin';

/** The session server. Set VITE_API_URL when building for production. */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';
