"use client";

interface Props {
  data: unknown;
  label: string;
}

export default function KpTable({ data, label }: Props) {
  const rows = normalise(data);
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#E5C99F] bg-[#FFFDF5] p-6 text-center text-xs text-[#8A6A2A]">
        {label} data not available.
      </div>
    );
  }
  const keys = discoverColumns(rows);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-[#2a1304]">{label}</h4>
      <div className="overflow-x-auto rounded-lg border border-[#E5C99F]">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-[#FFF6E8] to-[#FFFDF5]">
              {keys.map((k) => (
                <th key={k} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-[#6b4a1f] capitalize">
                  {k.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FFFDF5]"}>
                {keys.map((k) => (
                  <td key={k} className="whitespace-nowrap px-3 py-1.5 text-[#2a1304]">
                    {formatCell(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function normalise(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((r) => r && typeof r === "object") as Record<string, unknown>[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) return normalise(obj[key]);
    }
    return [obj];
  }
  return [];
}

function discoverColumns(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) { seen.add(k); order.push(k); }
    }
  }
  return order;
}

function formatCell(v: unknown): string {
  if (v == null) return "–";
  if (typeof v === "object") {
    if (Array.isArray(v)) return v.map(String).join(", ");
    return JSON.stringify(v);
  }
  return String(v);
}
