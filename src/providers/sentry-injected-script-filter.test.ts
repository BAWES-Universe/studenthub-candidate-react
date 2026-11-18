import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/react";
import { isInjectedDocumentScriptEvent } from "./sentry-injected-script-filter";

function buildEvent(
  filenames: string[],
  mechanism: Record<string, unknown> = { type: "onunhandledrejection", handled: false }
): ErrorEvent {
  return {
    type: undefined,
    exception: {
      values: [
        {
          type: "Error",
          value: "Na",
          mechanism: mechanism as any,
          stacktrace: {
            frames: filenames.map((filename, i) => ({ filename, lineno: 200 + i, colno: 1, in_app: true })),
          },
        },
      ],
    },
  } as ErrorEvent;
}

describe("isInjectedDocumentScriptEvent", () => {
  it("drops unhandled rejections thrown only from scripts inlined in the page (Chrome iOS translate)", () => {
    const event = buildEvent([
      "https://student.studenthub.co/name",
      "https://student.studenthub.co/name",
      "https://student.studenthub.co/name",
    ]);
    expect(isInjectedDocumentScriptEvent(event)).toBe(true);
  });

  it("keeps events with at least one bundled app frame", () => {
    const event = buildEvent([
      "https://student.studenthub.co/name",
      "https://student.studenthub.co/assets/page-9ZpCQEh_.js",
    ]);
    expect(isInjectedDocumentScriptEvent(event)).toBe(false);
  });

  it("keeps events without stack frames", () => {
    expect(isInjectedDocumentScriptEvent(buildEvent([]))).toBe(false);
    expect(isInjectedDocumentScriptEvent({ type: undefined } as ErrorEvent)).toBe(false);
  });

  it("keeps errors not raised through onunhandledrejection", () => {
    const event = buildEvent(["https://student.studenthub.co/name"], { type: "onerror", handled: false });
    expect(isInjectedDocumentScriptEvent(event)).toBe(false);
  });

  it("keeps handled errors", () => {
    const event = buildEvent(["https://student.studenthub.co/name"], { type: "onunhandledrejection", handled: true });
    expect(isInjectedDocumentScriptEvent(event)).toBe(false);
  });
});
