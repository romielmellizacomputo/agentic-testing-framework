// Disposable inboxes for test accounts, so flows never involve real people's email.
// Backed by the public mail.tm API (https://docs.mail.tm). Each inbox is private (token-protected),
// random, and only lives as long as the test needs it.
//
//   const box = await createInbox();            // { address, password, token }
//   const msg = await waitForMessage(box, { subject: /code|verify/i, timeoutMs: 120000 });
//   const code = extractCode(msg);              // first 4-8 digit code in the body
//   const link = extractLink(msg, /verify|invite|activate/);
//
// Override the provider base URL with AGT_MAIL_API (must be a mail.tm-compatible API).
import crypto from 'node:crypto';

const API = (process.env.AGT_MAIL_API || 'https://api.mail.tm').replace(/\/$/, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function call(method, path, { token, body } = {}, attempt = 0) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 429 && attempt < 5) { await sleep(1500 * (attempt + 1)); return call(method, path, { token, body }, attempt + 1); }
  if (!res.ok) throw new Error(`mail API ${method} ${path} -> ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export async function createInbox(prefix = 'agt') {
  const domains = await call('GET', '/domains');
  const domain = (domains['hydra:member'] || domains)[0]?.domain;
  if (!domain) throw new Error('mail API returned no domains');
  const local = `${prefix}${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`.toLowerCase();
  const address = `${local}@${domain}`;
  const password = crypto.randomBytes(18).toString('base64url');
  await call('POST', '/accounts', { body: { address, password } });
  const { token } = await call('POST', '/token', { body: { address, password } });
  return { address, password, token };
}

export async function listMessages(box) {
  const r = await call('GET', '/messages', { token: box.token });
  return r['hydra:member'] || r;
}

export async function readMessage(box, id) {
  const m = await call('GET', `/messages/${id}`, { token: box.token });
  const html = Array.isArray(m.html) ? m.html.join('\n') : (m.html || '');
  return { id, subject: m.subject || '', from: m.from?.address || '', text: m.text || '', html };
}

// Polls until a message matching `subject` (RegExp) arrives. Skips ids in `seen`.
export async function waitForMessage(box, { subject = /./, timeoutMs = 120000, intervalMs = 4000, seen = new Set() } = {}) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    for (const m of await listMessages(box)) {
      if (seen.has(m.id) || !subject.test(m.subject || '')) continue;
      seen.add(m.id);
      return readMessage(box, m.id);
    }
    await sleep(intervalMs);
  }
  throw new Error(`No email matching ${subject} within ${Math.round(timeoutMs / 1000)}s`);
}

export function extractCode(msg, re = /\b(\d{4,8})\b/) {
  const body = `${msg.subject}\n${msg.text}\n${msg.html.replace(/<[^>]+>/g, ' ')}`;
  return body.match(re)?.[1] || null;
}

export function extractLink(msg, match = /./) {
  const links = [...`${msg.html} ${msg.text}`.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(m => m[0].replace(/&amp;/g, '&'));
  return links.find(l => match.test(l)) || null;
}

export async function deleteInbox(box) {
  try {
    const me = await call('GET', '/me', { token: box.token });
    await call('DELETE', `/accounts/${me.id}`, { token: box.token });
  } catch { /* best effort */ }
}

// Strong random password that satisfies common rules (upper, lower, digit, symbol).
export function strongPassword() {
  return `Agt-${crypto.randomBytes(9).toString('base64url')}9a!`;
}
