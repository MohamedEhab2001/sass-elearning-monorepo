/**
 * Accessibility Utilities
 *
 * Helper functions for improving accessibility:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Screen reader support (Arabic)
 * - Focus management
 * - Color contrast
 */

// ============================================================================
// ARIA UTILITIES
// ============================================================================

/**
 * Get ARIA attributes for interactive elements
 *
 * @example
 * getAriaProps('button', 'حذف العنصر', { pressed: true })
 * // Returns: { role: 'button', 'aria-label': 'حذف العنصر', 'aria-pressed': true }
 */
export function getAriaProps(
  role: string,
  label: string,
  additionalProps?: Record<string, any>
): Record<string, any> {
  return {
    role,
    'aria-label': label,
    ...additionalProps,
  };
}

/**
 * Get ARIA attributes for loading states
 *
 * @example
 * getLoadingAriaProps('جاري التحميل')
 * // Returns: { 'aria-busy': true, 'aria-label': 'جاري التحميل' }
 */
export function getLoadingAriaProps(label: string = 'جاري التحميل') {
  return {
    'aria-busy': true,
    'aria-label': label,
    'aria-live': 'polite',
  };
}

/**
 * Get ARIA attributes for error states
 *
 * @example
 * getErrorAriaProps('خطأ في التحميل')
 * // Returns: { 'aria-invalid': true, 'aria-describedby': 'error-message' }
 */
export function getErrorAriaProps(errorId: string) {
  return {
    'aria-invalid': true,
    'aria-describedby': errorId,
  };
}

/**
 * Get ARIA attributes for expandable sections
 *
 * @example
 * getExpandableAriaProps(true, 'section-1')
 * // Returns: { 'aria-expanded': true, 'aria-controls': 'section-1' }
 */
export function getExpandableAriaProps(isExpanded: boolean, controlsId: string) {
  return {
    'aria-expanded': isExpanded,
    'aria-controls': controlsId,
  };
}

/**
 * Get ARIA attributes for modal dialogs
 *
 * @example
 * getModalAriaProps('حذف الدورة', 'هل أنت متأكد من حذف هذه الدورة؟')
 */
export function getModalAriaProps(title: string, description?: string) {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': 'modal-title',
    'aria-describedby': description ? 'modal-description' : undefined,
  };
}

/**
 * Get ARIA attributes for form fields
 *
 * @example
 * getFormFieldAriaProps('البريد الإلكتروني', true, 'email-error')
 */
export function getFormFieldAriaProps(
  label: string,
  required: boolean = false,
  errorId?: string
) {
  return {
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!errorId,
    'aria-describedby': errorId,
  };
}

/**
 * Get ARIA attributes for progress bars
 *
 * @example
 * getProgressAriaProps(75, 'تقدم الدورة')
 */
export function getProgressAriaProps(value: number, label: string) {
  return {
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-label': label,
  };
}

/**
 * Get ARIA attributes for tabs
 *
 * @example
 * getTabAriaProps(0, true, 'panel-0')
 */
export function getTabAriaProps(index: number, isSelected: boolean, panelId: string) {
  return {
    role: 'tab',
    'aria-selected': isSelected,
    'aria-controls': panelId,
    id: `tab-${index}`,
    tabIndex: isSelected ? 0 : -1,
  };
}

/**
 * Get ARIA attributes for tab panels
 *
 * @example
 * getTabPanelAriaProps(0, 'tab-0')
 */
export function getTabPanelAriaProps(index: number, tabId: string) {
  return {
    role: 'tabpanel',
    'aria-labelledby': tabId,
    id: `panel-${index}`,
    tabIndex: 0,
  };
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Handle keyboard navigation for lists
 *
 * @example
 * const handler = getKeyboardNavHandler(items, currentIndex, setCurrentIndex);
 * <div onKeyDown={handler}>...</div>
 */
export function getKeyboardNavHandler(
  items: any[],
  currentIndex: number,
  setCurrentIndex: (index: number) => void
) {
  return (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setCurrentIndex(Math.min(currentIndex + 1, items.length - 1));
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentIndex(Math.max(currentIndex - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(items.length - 1);
        break;
    }
  };
}

/**
 * Handle Enter/Space key presses for custom buttons
 *
 * @example
 * <div
 *   role="button"
 *   tabIndex={0}
 *   onKeyDown={handleActivationKeys(() => console.log('clicked'))}
 * >
 */
export function handleActivationKeys(callback: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}

/**
 * Handle Escape key for closing modals/dropdowns
 *
 * @example
 * useEffect(() => {
 *   const handler = handleEscapeKey(() => setIsOpen(false));
 *   document.addEventListener('keydown', handler);
 *   return () => document.removeEventListener('keydown', handler);
 * }, []);
 */
export function handleEscapeKey(callback: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  };
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Trap focus within an element (for modals, dialogs)
 *
 * @example
 * const trapFocus = createFocusTrap(modalRef.current);
 * trapFocus.activate();
 * // Later: trapFocus.deactivate();
 */
export function createFocusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return {
    activate() {
      element.addEventListener('keydown', handleTabKey);
      firstElement?.focus();
    },
    deactivate() {
      element.removeEventListener('keydown', handleTabKey);
    },
  };
}

/**
 * Get focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
}

/**
 * Move focus to element by ID
 *
 * @example
 * focusElement('error-message');
 */
export function focusElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ============================================================================
// SCREEN READER UTILITIES
// ============================================================================

/**
 * Announce message to screen readers
 * Creates a live region for announcements
 *
 * @example
 * announceToScreenReader('تم حفظ التغييرات بنجاح', 'polite');
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get screen reader only CSS classes (sr-only)
 * For visually hidden but screen-reader accessible content
 */
export function getScreenReaderOnlyClass(): string {
  return 'sr-only';
}

/**
 * Get skip navigation link props
 * Allows keyboard users to skip to main content
 *
 * @example
 * <a {...getSkipLinkProps('التخطي إلى المحتوى الرئيسي', '#main-content')}>
 */
export function getSkipLinkProps(label: string, targetId: string) {
  return {
    href: targetId,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded',
    'aria-label': label,
    onClick: (e: Event) => {
      e.preventDefault();
      const target = document.querySelector(targetId) as HTMLElement;
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
  };
}

// ============================================================================
// COLOR CONTRAST UTILITIES
// ============================================================================

/**
 * Check if color contrast meets WCAG AA standards
 * Requires contrast ratio of at least 4.5:1 for normal text
 *
 * @example
 * hasGoodContrast('#ffffff', '#000000') // true
 * hasGoodContrast('#ffffff', '#cccccc') // false
 */
export function hasGoodContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = level === 'AAA' ? 7 : 4.5;
  return ratio >= minRatio;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get relative luminance of a color
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// ============================================================================
// SEMANTIC HTML UTILITIES
// ============================================================================

/**
 * Get appropriate heading level
 * Helps maintain proper heading hierarchy
 *
 * @example
 * const HeadingTag = getHeadingTag(2); // 'h2'
 * <HeadingTag>عنوان</HeadingTag>
 */
export function getHeadingTag(level: 1 | 2 | 3 | 4 | 5 | 6): string {
  return `h${level}`;
}

/**
 * Get landmark role for sections
 *
 * @example
 * <section {...getLandmarkProps('navigation', 'القائمة الرئيسية')}>
 */
export function getLandmarkProps(
  landmark: 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'banner',
  label?: string
) {
  return {
    role: landmark,
    'aria-label': label,
  };
}

// ============================================================================
// FORM ACCESSIBILITY
// ============================================================================

/**
 * Generate unique IDs for form fields and their labels/errors
 *
 * @example
 * const ids = generateFormFieldIds('email');
 * <label htmlFor={ids.input}>{label}</label>
 * <input id={ids.input} aria-describedby={ids.error} />
 * <span id={ids.error}>{error}</span>
 */
export function generateFormFieldIds(fieldName: string) {
  return {
    input: `${fieldName}-input`,
    label: `${fieldName}-label`,
    error: `${fieldName}-error`,
    help: `${fieldName}-help`,
  };
}

/**
 * Get comprehensive form field accessibility props
 *
 * @example
 * const props = getFormFieldA11yProps('email', 'البريد الإلكتروني', {
 *   required: true,
 *   error: 'البريد الإلكتروني مطلوب'
 * });
 */
export function getFormFieldA11yProps(
  fieldName: string,
  label: string,
  options: {
    required?: boolean;
    error?: string;
    helpText?: string;
    disabled?: boolean;
  } = {}
) {
  const ids = generateFormFieldIds(fieldName);
  const { required = false, error, helpText, disabled = false } = options;

  const describedBy: string[] = [];
  if (error) describedBy.push(ids.error);
  if (helpText) describedBy.push(ids.help);

  return {
    input: {
      id: ids.input,
      'aria-labelledby': ids.label,
      'aria-required': required,
      'aria-invalid': !!error,
      'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
      'aria-disabled': disabled,
      disabled,
    },
    label: {
      id: ids.label,
      htmlFor: ids.input,
    },
    error: {
      id: ids.error,
      role: 'alert',
      'aria-live': 'assertive',
    },
    help: {
      id: ids.help,
    },
  };
}
