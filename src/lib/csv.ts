export type CsvValue = string | number | boolean | null | undefined;

function formatCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const normalized = String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const escaped = normalized.replace(/"/g, '""');
  const needsQuoting = /[",\n]/.test(escaped) || /^\s|\s$/.test(escaped);
  return needsQuoting ? `"${escaped}"` : escaped;
}

export function buildCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map((cell) => formatCsvValue(cell)).join(",")
  );
  return lines.join("\r\n");
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvValue[][]
): void {
  if (typeof window === "undefined") return;
  const csvContent = buildCsv(headers, rows);
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
