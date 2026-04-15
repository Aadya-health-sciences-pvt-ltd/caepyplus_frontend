import { NextResponse } from 'next/server';

/** Optional ALB probe: /portal/api/health when basePath is /portal (see caepy_portal_health_check_path). */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
