export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="app" className="w-full min-h-dvh bg-[var(--bg)]">
      {children}
    </div>
  );
}
