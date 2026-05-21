export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: "bg-red-900 text-red-300",
    Investigating: "bg-yellow-900 text-yellow-300",
    Resolved: "bg-green-900 text-green-300",
    FalseAlarm: "bg-gray-800 text-gray-400",
  };

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[status] ?? "bg-gray-800 text-gray-300"}`}
    >
      {status}
    </span>
  );
}
