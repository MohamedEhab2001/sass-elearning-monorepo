/**
 * Shared Formatting Utilities for Arabic/RTL Support
 *
 * This module provides consistent formatting functions for:
 * - Currency (EGP with Arabic locale)
 * - Dates (Arabic long format)
 * - Numbers (Western numerals for consistency)
 * - Relative time (منذ، بعد)
 * - Percentages
 * - File sizes
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

export interface CurrencyFormatOptions {
  /**
   * Currency code (default: 'EGP')
   */
  currency?: string;
  /**
   * Minimum fraction digits (default: 0)
   */
  minimumFractionDigits?: number;
  /**
   * Maximum fraction digits (default: 2)
   */
  maximumFractionDigits?: number;
  /**
   * Whether to use compact notation (e.g., 1.5K, 2M)
   */
  compact?: boolean;
}

/**
 * Format currency with Arabic locale
 * Uses Western numerals for consistency and clarity
 *
 * @example
 * formatCurrency(1500) // "1,500 ج.م"
 * formatCurrency(1500.50, { minimumFractionDigits: 2 }) // "1,500.50 ج.م"
 * formatCurrency(1500000, { compact: true }) // "1.5 مليون ج.م"
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'EGP',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    compact = false,
  } = options;

  if (compact && amount >= 1000000) {
    const millions = amount / 1000000;
    return `${millions.toFixed(1)} مليون ج.م`;
  }

  if (compact && amount >= 1000) {
    const thousands = amount / 1000;
    return `${thousands.toFixed(1)} ألف ج.م`;
  }

  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

export interface DateFormatOptions {
  /**
   * Date style: 'full' | 'long' | 'medium' | 'short'
   */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  /**
   * Time style: 'full' | 'long' | 'medium' | 'short'
   */
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  /**
   * Include time in output
   */
  includeTime?: boolean;
}

/**
 * Format date with Arabic locale
 *
 * @example
 * formatDate(new Date()) // "٢٥ نوفمبر ٢٠٢٥"
 * formatDate(new Date(), { includeTime: true }) // "٢٥ نوفمبر ٢٠٢٥ في ٣:٤٥ م"
 * formatDate(new Date(), { dateStyle: 'short' }) // "٢٥/١١/٢٠٢٥"
 */
export function formatDate(
  date: Date | string,
  options: DateFormatOptions = {}
): string {
  const {
    dateStyle = 'long',
    timeStyle = 'short',
    includeTime = false,
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (includeTime) {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle,
      timeStyle,
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle,
  }).format(dateObj);
}

/**
 * Format date in ISO format for inputs (YYYY-MM-DD)
 *
 * @example
 * formatDateForInput(new Date()) // "2025-11-25"
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}

/**
 * Format relative time in Arabic (منذ X، بعد X)
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "منذ ساعة"
 * formatRelativeTime(new Date(Date.now() + 86400000)) // "بعد يوم"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const isPast = diffMs < 0;

  const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });

  if (diffSec < 60) {
    return isPast ? rtf.format(-diffSec, 'second') : rtf.format(diffSec, 'second');
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return isPast ? rtf.format(-diffMin, 'minute') : rtf.format(diffMin, 'minute');
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return isPast ? rtf.format(-diffHour, 'hour') : rtf.format(diffHour, 'hour');
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return isPast ? rtf.format(-diffDay, 'day') : rtf.format(diffDay, 'day');
  }

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return isPast ? rtf.format(-diffMonth, 'month') : rtf.format(diffMonth, 'month');
  }

  const diffYear = Math.floor(diffMonth / 12);
  return isPast ? rtf.format(-diffYear, 'year') : rtf.format(diffYear, 'year');
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number with thousand separators
 * Uses Western numerals for consistency
 *
 * @example
 * formatNumber(1500) // "1,500"
 * formatNumber(1500.567, 2) // "1,500.57"
 */
export function formatNumber(
  value: number,
  decimals?: number
): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 *
 * @example
 * formatPercent(0.15) // "15%"
 * formatPercent(0.1567, 2) // "15.67%"
 */
export function formatPercent(
  value: number,
  decimals: number = 0
): string {
  const percentage = value * 100;
  return `${formatNumber(percentage, decimals)}%`;
}

/**
 * Format percentage from rate (already in 0-100 range)
 *
 * @example
 * formatPercentFromRate(15) // "15%"
 */
export function formatPercentFromRate(rate: number, decimals: number = 0): string {
  return `${formatNumber(rate, decimals)}%`;
}

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

/**
 * Format file size in bytes to human-readable format
 *
 * @example
 * formatFileSize(1024) // "1 كيلوبايت"
 * formatFileSize(1048576) // "1 ميجابايت"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';

  const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

// ============================================================================
// DURATION FORMATTING
// ============================================================================

/**
 * Format duration in seconds to readable format
 *
 * @example
 * formatDuration(3665) // "1 ساعة 1 دقيقة"
 * formatDuration(125) // "2 دقيقة 5 ثانية"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ثانية`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ساعة`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} دقيقة`);
  }

  if (secs > 0 && hours === 0) {
    parts.push(`${secs} ثانية`);
  }

  return parts.join(' ');
}

/**
 * Format duration for video player (HH:MM:SS or MM:SS)
 *
 * @example
 * formatVideoDuration(3665) // "1:01:05"
 * formatVideoDuration(125) // "2:05"
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${minutes}:${pad(secs)}`;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Truncate text with ellipsis
 * Properly handles Arabic text
 *
 * @example
 * truncateText("مرحبا بكم في المنصة التعليمية", 15) // "مرحبا بكم في..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Pluralize Arabic words based on count
 * Arabic has special plural rules
 *
 * @example
 * pluralize(1, 'طالب', 'طالبان', 'طلاب') // "طالب"
 * pluralize(2, 'طالب', 'طالبان', 'طلاب') // "طالبان"
 * pluralize(10, 'طالب', 'طالبان', 'طلاب') // "طلاب"
 */
export function pluralize(
  count: number,
  singular: string,
  dual: string,
  plural: string
): string {
  if (count === 1) return singular;
  if (count === 2) return dual;
  return plural;
}

/**
 * Format student count with proper pluralization
 *
 * @example
 * formatStudentCount(1) // "طالب واحد"
 * formatStudentCount(2) // "طالبان"
 * formatStudentCount(10) // "10 طلاب"
 */
export function formatStudentCount(count: number): string {
  if (count === 0) return 'لا يوجد طلاب';
  if (count === 1) return 'طالب واحد';
  if (count === 2) return 'طالبان';
  return `${formatNumber(count)} ${count <= 10 ? 'طلاب' : 'طالب'}`;
}

/**
 * Format course count with proper pluralization
 *
 * @example
 * formatCourseCount(1) // "دورة واحدة"
 * formatCourseCount(2) // "دورتان"
 * formatCourseCount(10) // "10 دورات"
 */
export function formatCourseCount(count: number): string {
  if (count === 0) return 'لا توجد دورات';
  if (count === 1) return 'دورة واحدة';
  if (count === 2) return 'دورتان';
  return `${formatNumber(count)} ${count <= 10 ? 'دورات' : 'دورة'}`;
}

// ============================================================================
// STATUS & BADGE UTILITIES
// ============================================================================

/**
 * Get status badge classes for Tailwind CSS
 * Consistent color scheme across the application
 */
export function getStatusBadgeClasses(status: string): string {
  const statusMap: Record<string, string> = {
    // General statuses
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700',

    // Course statuses
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-orange-100 text-orange-700',

    // Payment statuses
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',

    // Enrollment statuses
    enrolled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',

    // Payout statuses
    approved: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
  };

  return statusMap[status] || 'bg-gray-100 text-gray-700';
}

/**
 * Get Arabic label for status
 */
export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    // General statuses
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الانتظار',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    rejected: 'مرفوض',

    // Course statuses
    draft: 'مسودة',
    published: 'منشور',
    archived: 'مؤرشف',

    // Payment statuses
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    refunded: 'مسترد',

    // Enrollment statuses
    enrolled: 'مسجل',
    in_progress: 'قيد التقدم',

    // Payout statuses
    approved: 'تمت الموافقة',
    processing: 'جاري المعالجة',
  };

  return labelMap[status] || status;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a string is valid Arabic text
 */
export function isArabicText(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
}

/**
 * Check if a string contains only Arabic characters
 */
export function isOnlyArabic(text: string): boolean {
  const arabicRegex = /^[\u0600-\u06FF\s\d\p{P}]+$/u;
  return arabicRegex.test(text);
}
