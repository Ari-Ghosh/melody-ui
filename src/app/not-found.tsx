import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="mb-6 text-7xl">🎵</div>
      <h1 className="mb-2 text-4xl font-bold text-zinc-100">404</h1>
      <p className="mb-8 text-zinc-400 max-w-sm">
        This page isn&apos;t part of the melody. Let&apos;s get you back to the music.
      </p>
      <Link
        href="/feed"
        className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
      >
        Back to Discover
      </Link>
    </main>
  );
}
