/**
 * Base path configuration
 * -------------------------
 * Controls the sub-path at which the application is served, e.g.:
 *   VITE_BASE_PATH=/doctor-portal  →  https://company.com/doctor-portal
 *
 * Set VITE_BASE_PATH in:
 *   - .env for local dev
 *   - Dockerfile build-arg for production images
 *   - docker-compose.yml args for local docker testing
 *
 * Defaults to '' (root) to preserve existing behaviour when unset.
 */

const rawBase = import.meta.env.VITE_BASE_PATH ?? '';

/**
 * Normalised base path — always has a leading slash if non-empty,
 * and never has a trailing slash.
 * e.g. 'doctor-portal' → '/doctor-portal'
 *      '/doctor-portal/' → '/doctor-portal'
 *      '' → ''
 */
export const BASE_PATH: string = rawBase
    ? `/${rawBase.replace(/^\/|\/$/g, '')}`
    : '';

/**
 * Same value with a guaranteed trailing slash.
 * Useful as the Vite `base` option (Vite requires trailing slash).
 */
export const BASE_PATH_WITH_SLASH: string = BASE_PATH ? `${BASE_PATH}/` : '/';
