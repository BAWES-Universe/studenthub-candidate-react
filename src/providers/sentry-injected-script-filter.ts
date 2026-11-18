import type { ErrorEvent } from "@sentry/react";

/**
 * Detect unhandled promise rejections thrown entirely by scripts that the
 * browser injected into the document (e.g. Chrome for iOS's built-in Google
 * Translate). Those frames report the page route (e.g. https://host/name) as
 * their filename, while all of our own code is served from bundled `.js` files.
 *
 * Such events are not actionable for us (see SH-STUDENT-APP-5H, "Error: Na"),
 * so they are dropped. Any event with at least one frame from a script file is
 * kept, as are handled errors and events without a stack trace.
 */
export function isInjectedDocumentScriptEvent(event: ErrorEvent): boolean {
  const values = event?.exception?.values;
  if (!values || values.length === 0) {
    return false;
  }

  return values.every((exception) => {
    const mechanismType = exception.mechanism?.type || "";
    if (exception.mechanism?.handled !== false || mechanismType.indexOf("onunhandledrejection") === -1) {
      return false;
    }

    const frames = exception.stacktrace?.frames;
    if (!frames || frames.length === 0) {
      return false;
    }

    return frames.every((frame) => isDocumentRouteFilename(frame.filename || frame.abs_path));
  });
}

function isDocumentRouteFilename(filename?: string): boolean {
  if (!filename) {
    return false;
  }

  let pathname: string;
  try {
    pathname = new URL(filename, "https://localhost").pathname;
  } catch (err) {
    return false;
  }

  // Our code (app, vendor chunks, SDKs) is always loaded from script files.
  return !/\.(m?js|cjs|ts|tsx|jsx)$/i.test(pathname);
}
