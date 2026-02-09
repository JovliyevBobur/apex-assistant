interface ExportMessage {
  content: string;
  role: "user" | "assistant";
}

export function exportAsTxt(messages: ExportMessage[], title?: string): void {
  const header = title ? `=== ${title} ===\n\n` : "";
  const text = header + messages
    .map((m) => {
      const sender = m.role === "user" ? "👤 Siz" : "🤖 JBN AI";
      return `${sender}:\n${m.content}\n`;
    })
    .join("\n---\n\n");

  downloadFile(text, `${title || "chat"}.txt`, "text/plain");
}

export function exportAsPdf(messages: ExportMessage[], title?: string): void {
  const chatTitle = title || "JBN AI Chat";

  // Build HTML for PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${chatTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb; }
    .header h1 { font-size: 24px; color: #111; }
    .header p { font-size: 12px; color: #888; margin-top: 4px; }
    .message { margin-bottom: 20px; page-break-inside: avoid; }
    .sender { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
    .user .sender { color: #2563eb; }
    .assistant .sender { color: #059669; }
    .content { font-size: 14px; white-space: pre-wrap; padding: 12px 16px; border-radius: 12px; }
    .user .content { background: #eff6ff; border: 1px solid #bfdbfe; }
    .assistant .content { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; margin: 8px 0; }
    pre code { background: none; padding: 0; color: inherit; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${chatTitle}</h1>
    <p>${new Date().toLocaleString("uz-UZ")}</p>
  </div>
  ${messages
    .map(
      (m) => `
    <div class="message ${m.role}">
      <div class="sender">${m.role === "user" ? "👤 Siz" : "🤖 JBN AI"}</div>
      <div class="content">${escapeHtml(m.content)}</div>
    </div>
    <hr class="divider">`
    )
    .join("\n")}
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Fallback: download as HTML
    downloadFile(html, `${chatTitle}.html`, "text/html");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
