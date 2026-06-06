/**
 * PDF Generation Utility
 *
 * Generates PDFs from HTML templates using html2pdf.js
 * For server-side usage (edge functions), returns HTML string for client-side rendering
 * For client-side usage, generates actual PDF buffer
 */

/**
 * Generate PDF from HTML content
 *
 * In browser: generates actual PDF buffer
 * In server: throws error (use browser-side rendering instead)
 *
 * @param htmlContent - HTML string to render as PDF
 * @param filename - Output filename (without .pdf extension)
 * @param options - PDF generation options
 * @returns Promise resolving to PDF buffer
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
  // For MVP: PDF generation happens client-side via browser
  // Server-side can store HTML and let client render
  // This function is a placeholder for future server-side PDF generation

  throw new Error(
    'Server-side PDF generation not yet implemented. Use client-side rendering with html2pdf.js instead.',
  )
}

/**
 * Generate PDF from HTML template with data interpolation
 *
 * @param templateHtml - HTML template with {{variable}} placeholders
 * @param data - Data object to interpolate into template
 * @param filename - Output filename
 * @returns Promise resolving to interpolated HTML (for client-side PDF generation)
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
 * Generate HTML for client-side PDF rendering
 *
 * Returns HTML that can be rendered to PDF using html2pdf.js on the client
 *
 * @param templateHtml - HTML template with {{variable}} placeholders
 * @param data - Data object to interpolate into template
 * @returns Interpolated HTML string
 */
export function interpolateTemplate(
  templateHtml: string,
  data: Record<string, string | number>,
): string {
  let interpolated = templateHtml
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    interpolated = interpolated.replace(placeholder, String(value))
  }
  return interpolated
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
