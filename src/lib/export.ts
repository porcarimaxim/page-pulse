interface ChangeRecord {
  detectedAt: string;
  diffPercentage: number;
  notified: boolean;
}

export function toCSV(changes: ChangeRecord[], monitorName: string): string {
  const header = "Date,Diff %,Notified";
  const rows = changes.map(
    (c) => `${c.detectedAt},${c.diffPercentage},${c.notified}`
  );
  return [header, ...rows].join("\n");
}

export function toJSON(changes: ChangeRecord[], monitorName: string): string {
  return JSON.stringify(
    {
      monitor: monitorName,
      exportedAt: new Date().toISOString(),
      changes,
    },
    null,
    2
  );
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
