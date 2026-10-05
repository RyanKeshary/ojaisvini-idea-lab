"use client";
import { useEffect, useState } from "react";
import { onOutboxCount } from "@/lib/offline/sync";

/** Live count of queued offline writes (re-renders on change). */
export function useOutboxCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => onOutboxCount(setCount), []);
  return count;
}
