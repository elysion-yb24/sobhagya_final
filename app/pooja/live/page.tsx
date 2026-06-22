"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import VideoCallRoom from "../../components/video/VideoCallRoom";
import { getUserDetails } from "../../utils/auth-utils";

function PoojaLiveContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const roomName = sp?.get("room") || "";
  const token = sp?.get("token") || "";
  const wsURL = sp?.get("ws") || "";
  const threadId = sp?.get("thread") || "";
  // Optional astrologer name to title the call; defaults to the "Live Puja" label.
  const astro = sp?.get("astro") || "";

  const me = getUserDetails();
  const myName = me?.name || me?.displayName || "Devotee";

  if (!roomName || !token || !wsURL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4 p-6 text-center">
        <p>Invalid puja live link.</p>
        <button onClick={() => router.push(threadId ? `/pooja/chat/${threadId}` : "/pooja/orders")} className="px-5 py-2.5 rounded-xl bg-orange-500 font-semibold">
          Back to chat
        </button>
      </div>
    );
  }

  return (
    <VideoCallRoom
      token={token}
      wsURL={wsURL}
      roomName={roomName}
      participantName={myName}
      astrologerName={astro ? `${astro} · Live Puja` : "Live Puja"}
      onDisconnect={() => router.push(threadId ? `/pooja/chat/${threadId}` : "/pooja/orders")}
    />
  );
}

export default function PoojaLivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      }
    >
      <PoojaLiveContent />
    </Suspense>
  );
}
