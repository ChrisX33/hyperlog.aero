import type { APIRoute } from 'astro';
import { existsSync, writeFileSync, unlinkSync } from 'fs';

const MAINTENANCE_FILE = '/tmp/hyperlog-maintenance';

export const prerender = false;

export const GET: APIRoute = async () => {
  const maintenance = existsSync(MAINTENANCE_FILE);
  return new Response(JSON.stringify({ maintenance }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const internalKey = import.meta.env.JETLINK_INTERNAL_KEY || '';
  const providedKey = request.headers.get('x-internal-key') || '';

  if (!internalKey || providedKey !== internalKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { maintenance } = await request.json();

    if (maintenance) {
      writeFileSync(MAINTENANCE_FILE, '1');
    } else {
      if (existsSync(MAINTENANCE_FILE)) {
        unlinkSync(MAINTENANCE_FILE);
      }
    }

    return new Response(JSON.stringify({ maintenance }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
