/**
 * PDF Generation Utility
 *
 * Generates PDFs from HTML templates using a server-side PDF library.
 * Currently supports: html2pdf, pdfkit, or similar server-side PDF generation.
 *
 * Future improvements:
 * - Add browser-based PDF generation as fallback
 * - Support custom styling and fonts
 * - Add PDF signing capability (for contracts)
 */

/**
 * Generate PDF from HTML content
 *
 * @param htmlContent - HTML string to render as PDF
 * @param filename - Output filename (without .pdf extension)
 * @param options - PDF generation options
 * @returns Promise resolving to PDF buffer
 *
 * @example
 * const html = `<h1>Invoice</h1><p>Total: $100</p>`
 * const pdf = await generatePdfFromHtml(html, 'invoice-001')
 * // pdf is Buffer, can be saved to Supabase Storage
 */
export async function generatePdfFromHtml(
  htmlContent: string,
  filename: string,
  options?: {
    format?: 'A4' | 'Letter'
    margin?: { top: number; right: number; bottom: number; left: number }
    scale?: number
  },
): Promise<Buffer> {
  // TODO: Implement with html2pdf, pdfkit, or puppeteer
  // This is a placeholder that returns a dummy buffer for now
  // In production, use:
  // - html2pdf for Node.js
  // - pdfkit for custom PDF generation
  // - puppeteer for browser rendering

  // For now, throw error to indicate not yet implemented
  throw new Error(
    'PDF generation not yet implemented. Install html2pdf or pdfkit and implement this function.',
  )
}

/**
 * Generate PDF from HTML template with data interpolation
 *
 * @param templateHtml - HTML template with {{variable}} placeholders
 * @param data - Data object to interpolate into template
 * @param filename - Output filename
 * @returns Promise resolving to PDF buffer
 *
 * @example
 * const template = `<h1>Employment Contract</h1><p>Employee: {{employee_name}}</p>`
 * const data = { employee_name: 'John Doe' }
 * const pdf = await generatePdfFromTemplate(template, data, 'contract-001')
 */
export async function generatePdfFromTemplate(
  templateHtml: string,
  data: Record<string, string | number>,
  filename: string,
): Promise<Buffer> {
  // Simple Handlebars-style interpolation
  let interpolated = templateHtml
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    interpolated = interpolated.replace(placeholder, String(value))
  }

  return generatePdfFromHtml(interpolated, filename)
}

/**
 * Sanitize filename for safe storage
 * Removes special characters and ensures .pdf extension
 *
 * @param filename - Original filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '-') // Replace invalid chars with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .trim()

  // Ensure .pdf extension
  if (!sanitized.endsWith('.pdf')) {
    return `${sanitized}.pdf`
  }
  return sanitized
}

/**
 * Generate storage path for PDF (e.g., contracts, payslips)
 *
 * @param category - PDF category (e.g., 'contracts', 'payslips')
 * @param tenantId - Tenant ID
 * @param entityId - Entity ID (e.g., contract_id, employee_id)
 * @param filename - Original filename
 * @returns Storage path
 *
 * @example
 * const path = generateStoragePath('contracts', tenant_id, contract_id, 'contract-001')
 * // Returns: 'contracts/tenant-123/contract-456/contract-001.pdf'
 */
export function generateStoragePath(
  category: string,
  tenantId: string,
  entityId: string,
  filename: string,
): string {
  const safe = sanitizeFilename(filename)
  return `${category}/${tenantId}/${entityId}/${safe}`
}

/**
 * PDF generation options type
 */
export interface PdfOptions {
  format?: 'A4' | 'Letter'
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  scale?: number
}

/**
 * Default PDF options for business documents
 */
export const DEFAULT_PDF_OPTIONS: PdfOptions = {
  format: 'A4',
  margin: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15,
  },
  scale: 1,
}
