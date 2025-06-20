// app/call-history/page.tsx

import CallHistory from "../../components/history/CallHistory";

export default function CallHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">All Call History</h1>
      <CallHistory />
    </div>
  );
}
