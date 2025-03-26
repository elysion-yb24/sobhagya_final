import TransactionHistory from "../../components/history/Transaction-history"

// Define interface for Transaction
interface Transaction {
  _id: string;
  amount: number;
  date: string;
  status: string;
  type?: string;
}

export default function TransactionHistoryPage() {
  // Dummy transaction data
  const dummyTransactions: Transaction[] = [
    {
      _id: "transaction1",
      amount: 500.00,
      date: "2025-03-15T14:30:00.000Z",
      status: "completed",
      type: "credit"
    },
    {
      _id: "transaction2",
      amount: 70.80,
      date: "2025-03-13T11:11:00.000Z",
      status: "cancelled",
      type: "debit"
    },
    {
      _id: "transaction3",
      amount: 250.50,
      date: "2025-03-10T09:45:00.000Z",
      status: "completed",
      type: "credit"
    },
    {
      _id: "transaction4",
      amount: 150.25,
      date: "2025-03-08T16:20:00.000Z",
      status: "failed",
      type: "debit"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      <TransactionHistory transactions={dummyTransactions} />
    </div>
  );
}