const MAX_URL_LENGTH = 2_048;

export function getSafeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_URL_LENGTH) return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed !== value || /[\u0000-\u001f\u007f]/.test(value)) {
    return null;
  }

  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function isSafeHttpUrl(value: unknown): value is string {
  return getSafeHttpUrl(value) !== null;
}

export function getSafeEmailHref(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const email = value.trim();
  if (
    !email ||
    email.length > 254 ||
    /[\s\u0000-\u001f\u007f]/.test(email) ||
    !/^[^@]+@[^@]+\.[^@]+$/.test(email)
  ) {
    return null;
  }

  return `mailto:${encodeURIComponent(email).replace("%40", "@")}`;
}
