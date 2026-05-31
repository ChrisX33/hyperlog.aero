import { defineMiddleware } from 'astro:middleware';
import { existsSync } from 'fs';

const MAINTENANCE_FILE = '/tmp/hyperlog-maintenance';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);

  if (url.pathname === '/maintenance' || url.pathname.startsWith('/api/')) {
    return next();
  }

  if (existsSync(MAINTENANCE_FILE)) {
    return context.redirect('/maintenance', 302);
  }

  return next();
});
