"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BTBD_DEBUG]", {
      type: "NEXT_ROUTE_ERROR",
      message: error?.message || "Unknown Next.js route error",
      stack: error?.stack,
      digest: error?.digest,
      time: new Date().toISOString(),
    });
  }, [error]);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>তথ্য লোড করতে সমস্যা হয়েছে</h1>
      <p>সমস্যার বিস্তারিত Browser Console-এ [BTBD_DEBUG] নামে দেখা যাবে।</p>
      <button onClick={() => reset()}>আবার চেষ্টা করুন</button>
    </main>
  );
}
