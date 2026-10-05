"use client";
import { ListenButton } from "@/components/voice/ListenButton";
import { BigButton } from "@/components/ui/BigButton";

/** Offline fallback: friendly, voiced, with retry — never a dead end. */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span aria-hidden className="text-6xl">📴</span>
      <h1 className="display text-3xl font-bold">No internet — kaam surakshit hai</h1>
      <p className="text-base opacity-75">
        Your work is saved on this phone. It will send automatically when the network returns.
      </p>
      <ListenButton text="Internet nahin hai. Aapka kaam phone mein save hai." />
      <BigButton variant="secondary" onClick={() => window.location.reload()}>
        Try again
      </BigButton>
    </main>
  );
}
