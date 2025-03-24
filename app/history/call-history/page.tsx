// app/call-history/page.tsx

import CallLogs from "../../components/history/Calls-history";

// Define the shape if you like, or just inline the data:
interface Receiver {
  name: string;
}

interface CallLog {
  _id: string;
  receiver?: Receiver;
  createdAt: string;
  duration: number;
  status: string;
}

export default function CallHistoryPage() {
  // Dummy data: array of call logs (4 entries, for example)
  const dummyCallLogs: CallLog[] = [
    {
      _id: "calllog1",
      receiver: { name: "Arnav" },
      createdAt: "2025-03-17T07:32:14.339Z",
      duration: 58,
      status: "completed",
    },
    {
      _id: "calllog2",
      receiver: { name: "Riya" },
      createdAt: "2025-03-18T10:15:00.000Z",
      duration: 120,
      status: "completed",
    },
    {
      _id: "calllog3",
      receiver: { name: "Rahul" },
      createdAt: "2025-03-19T11:45:30.000Z",
      duration: 0,
      status: "missed",
    },
    {
      _id: "calllog4",
      receiver: { name: "Unknown" },
      createdAt: "2025-03-20T08:05:10.000Z",
      duration: 300,
      status: "completed",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">All Call History</h1>
      {/* Pass the dummy data to the Client Component */}
      <CallLogs callLogs={dummyCallLogs} />
    </div>
  );
}
