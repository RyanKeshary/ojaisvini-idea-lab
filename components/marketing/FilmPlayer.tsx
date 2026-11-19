"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * The product film: muted loop that plays only while on screen (a looping
 * video off-screen is pure battery drain), with one sound toggle because the
 * film has music. If the file never arrives, the poster stays up and the
 * toggle hides itself.
 */
export function FilmPlayer({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="ls-film__box">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onError={() => setHasVideo(false)}
        aria-label={poster}
      />
      {hasVideo && (
        <button
          type="button"
          className="ls-film__snd"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            if (ref.current) ref.current.muted = next;
          }}
          aria-label={muted ? "Unmute film" : "Mute film"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}
