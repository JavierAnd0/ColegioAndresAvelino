"use client";

export default function SentryExamplePage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sentry Test Page</h1>
      <button
        type="button"
        onClick={() => {
          throw new Error("Sentry test error");
        }}
      >
        Trigger test error
      </button>
    </div>
  );
}
