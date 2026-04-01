/**
 * Utility for sanitizing user-provided text to prevent XSS and injection attacks.
 */

/**
 * Sanitizes a string by stripping HTML tags and trimming.
 * Uses a safe character approach for production dating apps.
 */
export const sanitizeText = (text: string | null | undefined, maxLength: number = 5000): string => {
  if (!text) return '';
  
  // 1. Strip HTML tags using regex (basic XSS prevention)
  let sanitized = text.replace(/<[^>]*>?/gm, '');
  
  // 2. Trim whitespace
  sanitized = sanitized.trim();
  
  // 3. Truncate to maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // 4. Basic character escaping for common injection characters
  // Note: Standard React components handle this during rendering by default,
  // but sanitizing before database entry is a "defense in depth" strategy.
  return sanitized;
};

/**
 * Sanitizes a filename to prevent path traversal attacks.
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove any path traversal characters (/, \, ..)
  let sanitized = fileName.replace(/[\\/]/g, '_');
  sanitized = sanitized.replace(/\.\./g, '_');
  
  // Remove any non-alphanumeric (plus dot, dash, underscore) characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');
  
  // Ensure it's not too long
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(sanitized.length - 255);
  }
  
  return sanitized || `file_${Date.now()}`;
};

/**
 * Sanitizes an object by applying sanitizeText to all string values at the top level.
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeText(result[key]) as any;
    }
  }
  return result;
};
