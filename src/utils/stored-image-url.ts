export function resolvedStoredImageUrl(
  resolved: string | null | undefined,
  storedKey: string | null | undefined,
  legacyBase: string
): string | null {
  if (resolved) {
    return resolved;
  }
  if (resolved === null) {
    return null;
  }
  if (storedKey) {
    return legacyBase + storedKey;
  }
  return null;
}
