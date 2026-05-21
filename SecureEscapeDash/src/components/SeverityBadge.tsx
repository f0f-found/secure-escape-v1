export default function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Low: "bg-green-900 text-green-300",
    Medium: "bg-yellow-900 text-yellow-300",
    High: "bg-orange-900 text-orange-300",
    Critical: "bg-red-900 text-red-300",
  };

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[severity] ?? "bg-gray-800 text-gray-300"}`}
    >
      {severity}
    </span>
  );
}
