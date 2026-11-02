import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/react";
import { isGoogleAppInjectedStackOverflow } from "./sentry-injected-script-filter";

const GSA_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/444.2.1001595231 Mobile/15E148 Safari/604.1";
const SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1";

function buildEvent(frames: { filename: string; abs_path?: string }[], ua: string): ErrorEvent {
  return {
    type: undefined,
    request: { headers: { "User-Agent": ua } },
    exception: {
      values: [
        {
          type: "RangeError",
          value: "Maximum call stack size exceeded.",
          mechanism: { type: "onerror", handled: false },
          stacktrace: { frames },
        },
      ],
    },
  } as ErrorEvent;
}

// Frames as captured in SH-STUDENT-APP-58: all attributed to the page URL.
const injectedFrames = [
  { filename: "/personal-photo", abs_path: "https://student.studenthub.co/personal-photo" },
  { filename: "/personal-photo", abs_path: "https://student.studenthub.co/personal-photo" },
  { filename: "/profile", abs_path: "https://student.studenthub.co/profile" },
];

describe("isGoogleAppInjectedStackOverflow", () => {
  it("matches an overflow from the Google app's injected script", () => {
    expect(isGoogleAppInjectedStackOverflow(buildEvent(injectedFrames, GSA_UA))).toBe(true);
  });

  it("keeps overflows that include a frame from our bundle", () => {
    const frames = [
      ...injectedFrames,
      { filename: "/assets/index-abc123.js", abs_path: "https://student.studenthub.co/assets/index-abc123.js" },
    ];
    expect(isGoogleAppInjectedStackOverflow(buildEvent(frames, GSA_UA))).toBe(false);
  });

  it("keeps overflows from other browsers", () => {
    expect(isGoogleAppInjectedStackOverflow(buildEvent(injectedFrames, SAFARI_UA))).toBe(false);
  });

  it("keeps handled errors and other error types", () => {
    const handled = buildEvent(injectedFrames, GSA_UA);
    handled.exception!.values![0].mechanism = { type: "generic", handled: true };
    expect(isGoogleAppInjectedStackOverflow(handled)).toBe(false);

    const typeError = buildEvent(injectedFrames, GSA_UA);
    typeError.exception!.values![0].type = "TypeError";
    expect(isGoogleAppInjectedStackOverflow(typeError)).toBe(false);
  });

  it("keeps events without stack frames", () => {
    expect(isGoogleAppInjectedStackOverflow(buildEvent([], GSA_UA))).toBe(false);
  });
});
