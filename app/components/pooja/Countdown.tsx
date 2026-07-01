"use client";

import { useEffect, useState } from "react";

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Live, ticking countdown to a target time. Renders nothing if `to` is empty. */
export default function Countdown({
  to,
  className,
  prefix = "in ",
  endedLabel = "now",
}: {
  to?: string | number | Date | null;
  className?: string;
  prefix?: string;
  endedLabel?: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!to) return null;
  const ms = new Date(to).getTime() - now;
  return <span className={className}>{ms <= 0 ? endedLabel : `${prefix}${formatCountdown(ms)}`}</span>;
}
