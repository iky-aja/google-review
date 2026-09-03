import crypto from "crypto";

/**
 * Generate a cryptographically secure random token for card public_token.
 * 8 alphanumeric characters (upper+lower+digits), ~47 bits of entropy.
 */
export function generatePublicToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

const GOOGLE_REVIEW_DOMAINS = [
  "g.page",
  "search.google.com",
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
];

/**
 * Validates a Google Review URL against the domain whitelist.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateReviewUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("https://")) {
    return "URL harus menggunakan HTTPS.";
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return "Format URL tidak valid.";
  }
  const host = url.hostname.toLowerCase();
  const ok = GOOGLE_REVIEW_DOMAINS.some(
    (d) => host === d || host.endsWith("." + d)
  );
  if (!ok) {
    return "Domain tidak diizinkan. Gunakan URL Google Review (g.page, google.com, maps.app.goo.gl, dll).";
  }
  return null;
}
