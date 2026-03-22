import { NextRequest } from 'next/server';

/**
 * Debug endpoint to verify X-Origin-Verify and other request headers.
 * CloudFront adds X-Origin-Verify when forwarding to ALB. If present, WAF check passes.
 *
 * Access: https://dev1.linqmd.com/portal/caepy/api/debug-headers
 * Run: curl -i https://dev1.linqmd.com/portal/caepy/api/debug-headers
 * - Body: xOriginVerifyPresent (from app)
 * - Response headers: X-Amz-Cf-Id, Via = request came through CloudFront
 * Remove this route before production.
 */
export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const res = Response.json({
    xOriginVerify: headers['x-origin-verify'] ?? headers['X-Origin-Verify'] ?? null,
    xOriginVerifyPresent: !!(headers['x-origin-verify'] ?? headers['X-Origin-Verify']),
    allHeaders: headers,
  });
  res.headers.set('X-Debug-Note', 'Check response for X-Amz-Cf-Id to confirm CloudFront in path');
  return res;
}
