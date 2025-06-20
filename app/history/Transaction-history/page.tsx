import TransactionHistory from "../../components/history/TransactionHistory"

export default function TransactionHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      <TransactionHistory />
    </div>
  );
}