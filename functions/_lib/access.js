// Verifies the Cloudflare Access login token on admin requests.
// Needs env ACCESS_TEAM (e.g. "villajiji" for villajiji.cloudflareaccess.com) and ACCESS_AUD (the application's AUD tag).
let certs = null, certsAt = 0;
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
export async function accessUser(request, env) {
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token || !env.ACCESS_TEAM || !env.ACCESS_AUD) return null;
  const [h, p, s] = token.split('.');
  if (!s) return null;
  const header = JSON.parse(new TextDecoder().decode(b64u(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64u(p)));
  const iss = `https://${env.ACCESS_TEAM}.cloudflareaccess.com`;
  if (payload.iss !== iss) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.ACCESS_AUD) || payload.exp * 1000 < Date.now()) return null;
  if (!certs || Date.now() - certsAt > 3600e3) {
    certs = (await (await fetch(iss + '/cdn-cgi/access/certs')).json()).keys; certsAt = Date.now();
  }
  const jwk = certs.find(k => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(s), new TextEncoder().encode(h + '.' + p));
  return ok ? (payload.email || 'admin') : null;
}
