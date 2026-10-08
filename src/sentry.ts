import * as Sentry from "@sentry/capacitor";
import * as SentryReact from "@sentry/react";
import {
  redactPresignedReplayEvent,
  redactPresignedUploadBreadcrumb,
  redactPresignedUploadSpan,
  redactPresignedUploadTransaction,
} from "@/providers/logged-in/sentry-presign-redaction";

Sentry.init(
  {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    ...(import.meta.env.VITE_SENTRY_RELEASE
      ? { release: import.meta.env.VITE_SENTRY_RELEASE }
      : {}),
    // Set your dist version, such as "1"
    dist: "1.0.0",
    environment: import.meta.env.VITE_ENV_NAME,
    integrations: [
      // Registers and configures the Tracing integration,
      // which automatically instruments your application to monitor its
      // performance, including custom Angular routing instrumentation
      SentryReact.browserTracingIntegration(),
      // Registers the Replay integration,
      // which automatically captures Session Replays
      SentryReact.replayIntegration({
        beforeAddRecordingEvent: redactPresignedReplayEvent,
      }),
    ],
    beforeBreadcrumb: (breadcrumb) => redactPresignedUploadBreadcrumb(breadcrumb),
    beforeSendSpan: (span) => redactPresignedUploadSpan(span),
    beforeSendTransaction: (event) => redactPresignedUploadTransaction(event),
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [
   //   /^https:\/\/localhost/, 
   //   /^http:\/\/localhost/, 
      /^https:\/\/student\.dev\.studenthub\.co/,
      /^https:\/\/student\.studenthub\.co/
    ],
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },
  // Forward the init method from @sentry/angular
  SentryReact.init
);
