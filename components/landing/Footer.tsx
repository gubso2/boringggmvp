export function Footer() {
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-xs text-ink-500 sm:flex-row sm:items-center">
        <span className="font-display font-semibold tracking-tight text-ink-950">
          boringgg<span className="text-ink-300">.</span>
        </span>
        <span>© {new Date().getFullYear()} Boringgg. Buy smarter.</span>
      </div>
    </footer>
  );
}
