import { defineMiddleware } from 'astro:middleware';
import { existsSync } from 'fs';

const MAINTENANCE_FILE = '/tmp/hyperlog-maintenance';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const maintenance = existsSync(MAINTENANCE_FILE);

  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  if (url.pathname === '/maintenance') {
    if (!maintenance) return context.redirect('/', 302);
    return next();
  }

  if (maintenance) {
    return context.redirect('/maintenance', 302);
  }

  return next();
});
