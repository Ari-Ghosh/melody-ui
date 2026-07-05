"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="mb-6 text-7xl">🎵</div>
      <h1 className="mb-2 text-4xl font-bold text-zinc-100">Something went wrong</h1>
      <p className="mb-8 text-zinc-400 max-w-sm">
        A note fell flat. Try again or head back to the feed.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
      >
        Try Again
      </button>
    </main>
  );
}
