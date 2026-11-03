/**
 * Which requests need a signed-in staff session. Used by src/proxy.ts.
 *
 * 'page'  -> redirect to /admin/login when signed out
 * 'api'   -> 401 JSON when signed out
 * null    -> public
 */
export type AccessRule = 'page' | 'api' | null;

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

// Public API endpoints and the methods anyone may call on them.
const PUBLIC_API: Array<[RegExp, string[]]> = [
  [/^\/api\/blogs$/, ['GET']],
  [/^\/api\/collections$/, ['GET']],
  [/^\/api\/inquiries$/, ['POST']], // buyers submit enquiries
  [/^\/api\/catalog\/verify-code$/, ['POST']], // catalogue passcode check
  [/^\/api\/catalogs\/filter-count$/, ['POST']],
];

export function accessRuleFor(pathname: string, method: string): AccessRule {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (PUBLIC_ADMIN_PATHS.has(path)) return null;
  if (path === '/admin' || path.startsWith('/admin/')) return 'page';
  if (!path.startsWith('/api/')) return null;

  const m = method.toUpperCase();
  if (m === 'OPTIONS' || m === 'HEAD') return null;
  for (const [pattern, methods] of PUBLIC_API) {
    if (pattern.test(path) && methods.includes(m)) return null;
  }
  return 'api';
}
