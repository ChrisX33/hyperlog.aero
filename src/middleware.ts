import { defineMiddleware } from 'astro:middleware';
import { existsSync } from 'fs';

const MAINTENANCE_FILE = '/tmp/hyperlog-maintenance';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  // Always allow the API endpoint through so the toggle still works
  if (pathname.startsWith('/api/')) {
    return next();
  }

  if (existsSync(MAINTENANCE_FILE)) {
    return context.rewrite('/maintenance');
  }

  return next();
});
