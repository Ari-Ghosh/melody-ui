import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="mb-6 text-7xl">🎵</div>
      <h1 className="mb-2 text-4xl font-bold text-zinc-100">You&apos;re Offline</h1>
      <p className="mb-8 text-zinc-400 max-w-sm">
        Can&apos;t reach our servers right now. Check your connection and try again.
      </p>
      <Link
        href="/feed"
        className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
      >
        Retry
      </Link>
    </main>
  );
}
