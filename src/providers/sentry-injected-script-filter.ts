import type { ErrorEvent, StackFrame } from "@sentry/react";

/**
 * The Google iOS app (user agent token "GSA/") injects its own inline script
 * into pages, e.g. for in-page translation. On some pages that script recurses
 * forever (minified Gk <-> Ek) and throws
 * "RangeError: Maximum call stack size exceeded" (see SH-STUDENT-APP-58).
 *
 * None of our code is on that stack: every frame points at the page URL
 * itself (an inline/injected script) instead of one of our bundled chunks.
 * We can't fix third-party code and the error doesn't affect our app's state,
 * so we drop it. The match is kept narrow on purpose: any stack overflow with
 * even one frame from our own bundle, or from any other browser, still gets
 * reported.
 */
const STACK_OVERFLOW_MESSAGE = /Maximum call stack size exceeded/i;
const GOOGLE_APP_UA = /\bGSA\//;
const FIRST_PARTY_SCRIPT = /(\/assets\/|\.m?js(?:[?#]|$))/i;

function isFirstPartyFrame(frame: StackFrame): boolean {
  const path = frame.abs_path || frame.filename || "";
  // A frame with no location can't be shown to be third-party, so keep the event.
  if (!path) return true;
  return FIRST_PARTY_SCRIPT.test(path);
}

function getUserAgent(event: ErrorEvent): string {
  const headers = event.request?.headers || {};
  const fromEvent = headers["User-Agent"] || headers["user-agent"];
  if (fromEvent) return fromEvent;
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    return navigator.userAgent;
  }
  return "";
}

export function isGoogleAppInjectedStackOverflow(event: ErrorEvent): boolean {
  const values = event.exception?.values;
  if (!values || values.length === 0) return false;

  const matches = values.some((exception) => {
    if (exception.type !== "RangeError") return false;
    if (!STACK_OVERFLOW_MESSAGE.test(exception.value || "")) return false;
    if (exception.mechanism?.handled !== false) return false;

    const frames = exception.stacktrace?.frames;
    if (!frames || frames.length === 0) return false;
    return frames.every((frame) => !isFirstPartyFrame(frame));
  });

  if (!matches) return false;
  return GOOGLE_APP_UA.test(getUserAgent(event));
}
