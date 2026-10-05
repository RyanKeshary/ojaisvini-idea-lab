"use client";
import { useEffect } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { ListenButton } from "@/components/voice/ListenButton";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="mr">
      <body>
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="display text-3xl font-bold">Kuch ruk gaya — chinta mat karo</h1>
          <p className="text-base opacity-75">Something stopped. Your work is safe. Try again, ask Ojas, or call Sakhi.</p>
          <ListenButton text="Kuch ruk gaya. Chinta mat karo. Dobara koshish karein." />
          <BigButton onClick={reset}>Phir koshish karein · Try again</BigButton>
        </main>
      </body>
    </html>
  );
}
