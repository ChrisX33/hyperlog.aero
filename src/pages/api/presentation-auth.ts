import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const password = formData.get('password') as string;
  const expectedPassword = process.env.PRESENTATION_PASSWORD;

  if (!expectedPassword || password !== expectedPassword) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/presentation?error=1' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/presentation',
      'Set-Cookie': 'presentation_auth=1; Path=/; SameSite=Lax; HttpOnly; Max-Age=86400',
    },
  });
};
