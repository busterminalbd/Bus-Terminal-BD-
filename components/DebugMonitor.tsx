"use client";

import { useEffect } from "react";

type ConsolePayload = {
  type: string;
  message: string;
  url?: string;
  status?: number;
  statusText?: string;
  stack?: string;
  time: string;
};

function logDebug(payload: ConsolePayload) {
  // One consistent prefix makes browser-console filtering easy:
  // filter for "BTBD_DEBUG".
  console.error("[BTBD_DEBUG]", payload);
}

export default function DebugMonitor() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      let requestUrl = "";
      try {
        const input = args[0];
        requestUrl =
          typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : input?.url || "";
      } catch {}

      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          logDebug({
            type: "NETWORK_HTTP_ERROR",
            message: `HTTP request failed: ${response.status} ${response.statusText}`,
            url: requestUrl,
            status: response.status,
            statusText: response.statusText,
            time: new Date().toISOString(),
          });
        }

        return response;
      } catch (error) {
        logDebug({
          type: "NETWORK_FETCH_ERROR",
          message: error instanceof Error ? error.message : String(error),
          url: requestUrl,
          stack: error instanceof Error ? error.stack : undefined,
          time: new Date().toISOString(),
        });
        throw error;
      }
    };

    const onError = (event: ErrorEvent) => {
      logDebug({
        type: "JAVASCRIPT_ERROR",
        message: event.message || "Unknown JavaScript error",
        url: event.filename,
        stack: event.error?.stack,
        time: new Date().toISOString(),
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      logDebug({
        type: "UNHANDLED_PROMISE_REJECTION",
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        time: new Date().toISOString(),
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    console.info(
      "%c[BTBD_DEBUG] Diagnostic monitor enabled",
      "font-weight:bold"
    );

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
