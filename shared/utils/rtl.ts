/**
 * RTL (Right-to-Left) Utilities
 *
 * Helper functions for handling RTL layouts, icon flipping,
 * and directional CSS classes in Arabic interfaces
 */

// ============================================================================
// DIRECTIONAL CLASSES
// ============================================================================

/**
 * Get margin classes based on direction
 * Automatically flips for RTL
 *
 * @example
 * getMarginClass('left', 4) // 'mr-4' (in RTL context)
 * getMarginClass('right', 4) // 'ml-4' (in RTL context)
 */
export function getMarginClass(
  direction: 'left' | 'right' | 'top' | 'bottom',
  size: number
): string {
  const sizeClass = size.toString();

  if (direction === 'left') return `mr-${sizeClass}`;
  if (direction === 'right') return `ml-${sizeClass}`;
  if (direction === 'top') return `mt-${sizeClass}`;
  if (direction === 'bottom') return `mb-${sizeClass}`;

  return '';
}

/**
 * Get padding classes based on direction
 *
 * @example
 * getPaddingClass('left', 4) // 'pr-4' (in RTL context)
 */
export function getPaddingClass(
  direction: 'left' | 'right' | 'top' | 'bottom',
  size: number
): string {
  const sizeClass = size.toString();

  if (direction === 'left') return `pr-${sizeClass}`;
  if (direction === 'right') return `pl-${sizeClass}`;
  if (direction === 'top') return `pt-${sizeClass}`;
  if (direction === 'bottom') return `pb-${sizeClass}`;

  return '';
}

/**
 * Get text alignment class for RTL
 *
 * @example
 * getTextAlignClass('left') // 'text-right' (in RTL)
 * getTextAlignClass('right') // 'text-left' (in RTL)
 */
export function getTextAlignClass(align: 'left' | 'right' | 'center'): string {
  if (align === 'center') return 'text-center';
  if (align === 'left') return 'text-right';
  if (align === 'right') return 'text-left';
  return 'text-right';
}

/**
 * Get flex direction class for RTL
 * Automatically flips row directions
 *
 * @example
 * getFlexDirectionClass('row') // 'flex-row-reverse' (in RTL)
 */
export function getFlexDirectionClass(
  direction: 'row' | 'row-reverse' | 'col' | 'col-reverse'
): string {
  if (direction === 'row') return 'flex-row-reverse';
  if (direction === 'row-reverse') return 'flex-row';
  if (direction === 'col') return 'flex-col';
  if (direction === 'col-reverse') return 'flex-col-reverse';
  return 'flex-row-reverse';
}

// ============================================================================
// ICON UTILITIES
// ============================================================================

/**
 * Icons that should be flipped in RTL
 */
const FLIP_ICONS = [
  'ArrowRight',
  'ArrowLeft',
  'ChevronRight',
  'ChevronLeft',
  'ArrowUpRight',
  'ArrowUpLeft',
  'ArrowDownRight',
  'ArrowDownLeft',
  'CornerUpRight',
  'CornerUpLeft',
  'CornerDownRight',
  'CornerDownLeft',
  'TrendingUp',
  'TrendingDown',
  'Forward',
  'Rewind',
  'SkipForward',
  'SkipBack',
  'ChevronsRight',
  'ChevronsLeft',
];

/**
 * Check if an icon should be flipped in RTL
 *
 * @example
 * shouldFlipIcon('ArrowRight') // true
 * shouldFlipIcon('Check') // false
 */
export function shouldFlipIcon(iconName: string): boolean {
  return FLIP_ICONS.includes(iconName);
}

/**
 * Get icon flip class for RTL
 * Returns 'scale-x-[-1]' for icons that need flipping
 *
 * @example
 * getIconFlipClass('ArrowRight') // 'scale-x-[-1]'
 * getIconFlipClass('Check') // ''
 */
export function getIconFlipClass(iconName: string): string {
  return shouldFlipIcon(iconName) ? 'scale-x-[-1]' : '';
}

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

/**
 * Get border radius classes for RTL
 * Flips corner-specific border radius
 *
 * @example
 * getBorderRadiusClass('rounded-l-lg') // 'rounded-r-lg' (in RTL)
 */
export function getBorderRadiusClass(className: string): string {
  if (className.includes('rounded-l-')) {
    return className.replace('rounded-l-', 'rounded-r-');
  }
  if (className.includes('rounded-r-')) {
    return className.replace('rounded-r-', 'rounded-l-');
  }
  if (className.includes('rounded-tl-')) {
    return className.replace('rounded-tl-', 'rounded-tr-');
  }
  if (className.includes('rounded-tr-')) {
    return className.replace('rounded-tr-', 'rounded-tl-');
  }
  if (className.includes('rounded-bl-')) {
    return className.replace('rounded-bl-', 'rounded-br-');
  }
  if (className.includes('rounded-br-')) {
    return className.replace('rounded-br-', 'rounded-bl-');
  }
  return className;
}

/**
 * Get position classes for RTL
 *
 * @example
 * getPositionClass('left', 4) // 'right-4' (in RTL)
 */
export function getPositionClass(
  position: 'left' | 'right' | 'top' | 'bottom',
  size: number | string
): string {
  const sizeClass = size.toString();

  if (position === 'left') return `right-${sizeClass}`;
  if (position === 'right') return `left-${sizeClass}`;
  if (position === 'top') return `top-${sizeClass}`;
  if (position === 'bottom') return `bottom-${sizeClass}`;

  return '';
}

// ============================================================================
// FORM UTILITIES
// ============================================================================

/**
 * Get input direction attribute
 * Some inputs (like email, phone) should remain LTR even in RTL pages
 *
 * @example
 * getInputDirection('email') // 'ltr'
 * getInputDirection('text') // 'rtl'
 */
export function getInputDirection(
  type: 'email' | 'url' | 'tel' | 'number' | 'password' | 'text'
): 'ltr' | 'rtl' {
  const ltrInputs = ['email', 'url', 'tel', 'number', 'password'];
  return ltrInputs.includes(type) ? 'ltr' : 'rtl';
}

/**
 * Get text direction class for inputs
 *
 * @example
 * getInputTextClass('email') // 'text-left'
 * getInputTextClass('text') // 'text-right'
 */
export function getInputTextClass(
  type: 'email' | 'url' | 'tel' | 'number' | 'password' | 'text'
): string {
  return getInputDirection(type) === 'ltr' ? 'text-left' : 'text-right';
}

// ============================================================================
// TABLE UTILITIES
// ============================================================================

/**
 * Get table cell alignment for RTL
 * Default alignment for RTL tables
 */
export function getTableCellAlign(): 'right' | 'left' {
  return 'right';
}

/**
 * Get table header classes for RTL
 */
export function getTableHeaderClass(): string {
  return 'text-right';
}

// ============================================================================
// NAVIGATION UTILITIES
// ============================================================================

/**
 * Transform transform properties for RTL
 * Useful for slide-in animations
 *
 * @example
 * getSlideTransform('translateX(100%)') // 'translateX(-100%)' (in RTL)
 */
export function getSlideTransform(transform: string): string {
  if (transform.includes('translateX(')) {
    return transform.replace(/translateX\(([-\d.]+)(%|px|rem|em)\)/, (match, value, unit) => {
      const numValue = parseFloat(value);
      return `translateX(${-numValue}${unit})`;
    });
  }
  return transform;
}

/**
 * Get drawer position for RTL
 * Flips left/right drawer positions
 *
 * @example
 * getDrawerPosition('left') // 'right' (in RTL)
 */
export function getDrawerPosition(position: 'left' | 'right' | 'top' | 'bottom'): string {
  if (position === 'left') return 'right';
  if (position === 'right') return 'left';
  return position;
}

// ============================================================================
// CSS-IN-JS UTILITIES
// ============================================================================

/**
 * Get RTL-aware CSS object
 * Flips directional properties
 *
 * @example
 * getRTLStyles({ marginLeft: 10, marginRight: 20 })
 * // Returns: { marginRight: 10, marginLeft: 20 }
 */
export function getRTLStyles(styles: Record<string, any>): Record<string, any> {
  const rtlStyles: Record<string, any> = {};

  for (const [key, value] of Object.entries(styles)) {
    let newKey = key;

    // Flip margin/padding
    if (key.includes('Left')) {
      newKey = key.replace('Left', 'Right');
    } else if (key.includes('Right')) {
      newKey = key.replace('Right', 'Left');
    } else if (key === 'left') {
      newKey = 'right';
    } else if (key === 'right') {
      newKey = 'left';
    }

    // Flip text alignment
    if (key === 'textAlign') {
      if (value === 'left') {
        rtlStyles[key] = 'right';
        continue;
      } else if (value === 'right') {
        rtlStyles[key] = 'left';
        continue;
      }
    }

    rtlStyles[newKey] = value;
  }

  return rtlStyles;
}

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Get ARIA label direction
 * Returns appropriate direction for screen readers
 */
export function getAriaLabel(label: string, isRTL: boolean = true): {
  'aria-label': string;
  dir: 'rtl' | 'ltr';
} {
  return {
    'aria-label': label,
    dir: isRTL ? 'rtl' : 'ltr',
  };
}

/**
 * Get reading direction attribute
 */
export function getReadingDirection(isArabic: boolean = true): 'rtl' | 'ltr' {
  return isArabic ? 'rtl' : 'ltr';
}
