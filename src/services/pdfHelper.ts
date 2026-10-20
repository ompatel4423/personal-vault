/**
 * PDF Document Helper & Generator
 * Generates valid vector PDF documents for default templates
 * and handles PDF conversions and formatting.
 */

export function createSamplePdf(title: string, subtitle: string, lines: string[]): string {
  // Sanitize lines to ensure standard PDF character set
  const cleanTitle = title.replace(/[()]/g, '');
  const cleanSubtitle = subtitle.replace(/[()]/g, '');
  const cleanLines = lines.map((l) => l.replace(/[()]/g, ''));

  const contentStream = [
    `BT /F1 18 Tf 50 740 Td (${cleanTitle}) Tj ET`,
    `BT /F1 11 Tf 50 718 Td (${cleanSubtitle}) Tj ET`,
    `0.2 0.7 0.5 rg 50 705 495 2 re f`, // emerald accent line
    `0 0 0 rg`,
    ...cleanLines.map((line, idx) => `BT /F1 10 Tf 50 ${675 - idx * 24} Td (${line}) Tj ET`),
    `0.5 0.5 0.5 rg`,
    `BT /F1 8 Tf 50 80 Td (CONFIDENTIAL - END-TO-END AES-256-GCM ENCRYPTED PERSONAL VAULT DOCUMENT) Tj ET`,
    `BT /F1 8 Tf 50 68 Td (Digitally Verified & Protected on iPhone 15 Pro Secure Enclave) Tj ET`,
  ].join('\n');

  const streamLength = contentStream.length;
  const pdfString = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
5 0 obj << /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000239 00000 n 
0000000315 00000 n 
trailer << /Root 1 0 R /Size 6 >>
startxref
${420 + streamLength}
%%EOF`;

  return `data:application/pdf;base64,${window.btoa(pdfString)}`;
}

/**
 * Format bytes to human readable format (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
