"use client";

// Opening a pooja chat = full same-tab navigation to the live chat web app
// (chat.sobhagya.in / localhost:9002). We first seed the auth cookies it reads
// (via the handoff), then redirect. The chat web app hosts the messaging UI +
// (for puja threads) the Schedule/Join Puja Video bar.

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAuthenticated } from "../../../utils/auth-utils";
import { handoffToChat } from "../../../utils/pooja-api";

function RedirectContent() {
  const params = useParams();
  const router = useRouter();
  const threadId = (params?.threadId as string) || "";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(`/pooja/chat/${threadId}`)}`);
      return;
    }
    if (!threadId) {
      setError("Missing conversation.");
      return;
    }
    handoffToChat(threadId).then((url) => {
      if (url) window.location.href = url;
      else setError("Couldn't open the chat. Please try again from My Orders.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] gap-3 px-6 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => router.push("/pooja/orders")} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold">
          My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] gap-3">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      <p className="text-sm text-gray-500">Opening your chat…</p>
    </div>
  );
}

export default function PoojaChatRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-90px)]">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      }
    >
      <RedirectContent />
    </Suspense>
  );
}
