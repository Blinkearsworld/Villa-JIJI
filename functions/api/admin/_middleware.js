// Every /api/admin/* request must carry a valid Cloudflare Access login.
import { accessUser } from '../../_lib/access.js';
import { json } from '../../_lib/core.js';
export async function onRequest(ctx) {
  let user = await accessUser(ctx.request, ctx.env).catch(() => null);
  // local testing only: `wrangler pages dev` on localhost with ADMIN_DEV=1
  if (!user && ctx.env.ADMIN_DEV === '1' && new URL(ctx.request.url).hostname === 'localhost') user = 'dev@localhost';
  if (!user) return json({ error: 'not signed in' }, 401);
  ctx.data.user = user;
  return ctx.next();
}
