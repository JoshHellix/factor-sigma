"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "40rem" }}>
        <h1>Something went wrong</h1>
        <p style={{ color: "#475569" }}>Factor failed to load. Refresh the page or try again.</p>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", padding: "1rem", background: "#f1f5f9" }}>
          {error.message}
        </pre>
        <button type="button" onClick={() => reset()} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
