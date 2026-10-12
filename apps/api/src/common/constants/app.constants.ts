/**
 * Centralised application constants — avoids magic numbers scattered across the codebase.
 */
export const APP_CONSTANTS = {
    /** Redis TTL for summary/leaderboard/progress caches (seconds) */
    SUMMARY_CACHE_TTL: 30,

    /** Global rate-limit window in milliseconds (1 minute) */
    THROTTLE_TTL_MS: 60_000,

    /** Max requests per IP per throttle window */
    THROTTLE_LIMIT: 100,

    /** httpOnly cookie name used for JWT storage */
    AUTH_COOKIE_NAME: 'access_token',

    /** Default JWT expiration when JWT_EXPIRATION env is not set */
    JWT_DEFAULT_EXPIRATION: '8h',

    /** Pagination defaults */
    PAGINATION_DEFAULT_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
} as const;
