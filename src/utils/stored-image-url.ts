/**
 * A supplied URL wins.
 * null or an empty string means the current API marked the file unavailable.
 * undefined means an older API omitted the field, so the previous Cloudinary address still applies.
 */
export function resolvedStoredImageUrl(
  resolved: string | null | undefined,
  storedKey: string | null | undefined,
  legacyBase: string
): string | null {
  if (typeof resolved === 'string') {
    return resolved === '' ? null : resolved;
  }
  if (resolved === null) {
    return null;
  }
  if (storedKey) {
    return legacyBase + storedKey;
  }
  return null;
}
