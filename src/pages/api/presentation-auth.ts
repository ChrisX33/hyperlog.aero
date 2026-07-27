import type { APIRoute } from 'astro';

export const prerender = false;

const ALLOWED_REDIRECTS = ['/presentation', '/presentation/alpa'];

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const password = formData.get('password') as string;
  const expectedPassword = process.env.PRESENTATION_PASSWORD;
  const nextRaw = formData.get('next') as string | null;
  const next = ALLOWED_REDIRECTS.includes(nextRaw ?? '') ? nextRaw! : '/presentation';

  if (!expectedPassword || password !== expectedPassword) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${next}?error=1` },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': next,
      'Set-Cookie': 'presentation_auth=1; Path=/; SameSite=Lax; HttpOnly; Max-Age=86400',
    },
  });
};
