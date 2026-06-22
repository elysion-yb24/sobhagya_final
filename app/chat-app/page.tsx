"use client";

// "Chat" entry point → same-tab navigation to the live chat web app
// (chat.sobhagya.in / localhost:9002). Seeds the auth cookies it reads (via the
// handoff) first, then redirects to the thread list. Used by the header/footer
// "Chat" links so the user lands authenticated in the same tab.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAuthenticated } from "../utils/auth-utils";
import { handoffToChat } from "../utils/pooja-api";

export default function ChatAppRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent("/chat-app")}`);
      return;
    }
    handoffToChat().then((url) => {
      if (url) window.location.href = url;
      else setError("Couldn't open chat. Please try again.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] gap-3 px-6 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => router.push("/")} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold">
          Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] gap-3">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      <p className="text-sm text-gray-500">Opening your chats…</p>
    </div>
  );
}
