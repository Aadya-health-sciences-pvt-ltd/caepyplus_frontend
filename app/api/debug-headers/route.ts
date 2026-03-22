import { NextRequest } from 'next/server';

/**
 * Debug endpoint to verify X-Origin-Verify and other request headers.
 * CloudFront adds X-Origin-Verify when forwarding to ALB. If present, WAF check passes.
 *
 * Access: https://dev1.linqmd.com/portal/caepy/api/debug-headers
 * Remove this route before production.
 */
export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return Response.json({
    xOriginVerify: headers['x-origin-verify'] ?? headers['X-Origin-Verify'] ?? null,
    xOriginVerifyPresent: !!(headers['x-origin-verify'] ?? headers['X-Origin-Verify']),
    allHeaders: headers,
  });
}
