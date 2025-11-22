# Arabic RTL Style Guide & Best Practices

This document outlines the standards and best practices for developing Arabic/RTL interfaces in the SASS E-Learning platform.

## Table of Contents

1. [Formatting Standards](#formatting-standards)
2. [RTL Layout Guidelines](#rtl-layout-guidelines)
3. [Typography & Language](#typography--language)
4. [Accessibility](#accessibility)
5. [Component Guidelines](#component-guidelines)
6. [Testing Checklist](#testing-checklist)

---

## Formatting Standards

### Currency

**Standard:** Use Egyptian Pound (EGP) with Arabic locale, Western numerals

```typescript
import { formatCurrency } from '@/shared/utils/formatting';

// ✅ Correct
formatCurrency(1500) // "1,500 ج.م"
formatCurrency(1500.50, { minimumFractionDigits: 2 }) // "1,500.50 ج.م"

// ❌ Avoid
`${amount} EGP` // No formatting
`${amount} جنيه` // Inconsistent
```

**Rationale:** Western numerals (1, 2, 3) are clearer than Arabic-Indic numerals (١, ٢, ٣) for financial data, reducing confusion and errors.

### Dates

**Standard:** Use Arabic long format with `ar-EG` locale

```typescript
import { formatDate, formatRelativeTime } from '@/shared/utils/formatting';

// ✅ Correct
formatDate(new Date()) // "٢٥ نوفمبر ٢٠٢٥"
formatDate(new Date(), { includeTime: true }) // "٢٥ نوفمبر ٢٠٢٥ في ٣:٤٥ م"
formatRelativeTime(new Date(Date.now() - 3600000)) // "منذ ساعة"

// ❌ Avoid
new Date().toLocaleDateString() // Unpredictable format
new Date().toString() // English format
```

### Numbers

**Standard:** Use Western numerals with thousand separators

```typescript
import { formatNumber } from '@/shared/utils/formatting';

// ✅ Correct
formatNumber(1500) // "1,500"
formatNumber(1500.567, 2) // "1,500.57"

// ❌ Avoid
amount.toString() // No separators
amount.toLocaleString('ar-SA') // May use Arabic-Indic numerals
```

### Percentages

**Standard:** Format with `%` symbol, no spaces

```typescript
import { formatPercent, formatPercentFromRate } from '@/shared/utils/formatting';

// ✅ Correct
formatPercent(0.15) // "15%"
formatPercentFromRate(15) // "15%"

// ❌ Avoid
`${rate} %` // Extra space
`٪${rate}` // Arabic percent sign
```

---

## RTL Layout Guidelines

### Directional Properties

**Always use logical properties** instead of directional ones:

```tsx
// ✅ Correct - Use utility functions
import { getMarginClass, getPaddingClass } from '@/shared/utils/rtl';

<div className={getMarginClass('left', 4)}> // Becomes 'mr-4' in RTL
<div className={getPaddingClass('right', 6)}> // Becomes 'pl-6' in RTL

// ❌ Avoid - Hard-coded directions
<div className="ml-4"> // Won't flip in RTL
<div className="pr-6"> // Wrong direction in RTL
```

### Flex and Grid Layouts

```tsx
// ✅ Correct
import { getFlexDirectionClass } from '@/shared/utils/rtl';

<div className={`flex ${getFlexDirectionClass('row')}`}>
  // flex-row-reverse in RTL

// ❌ Avoid
<div className="flex flex-row">
  // Won't reverse in RTL
```

### Icons

**Flip directional icons** in RTL:

```tsx
import { getIconFlipClass, shouldFlipIcon } from '@/shared/utils/rtl';
import { ArrowRight, Check } from 'lucide-react';

// ✅ Correct
<ArrowRight className={getIconFlipClass('ArrowRight')} />
<Check className={getIconFlipClass('Check')} /> // Won't flip (not directional)

// ❌ Avoid
<ArrowRight /> // Pointing wrong direction in RTL
```

**Icons that should flip:**
- ArrowRight/Left
- ChevronRight/Left
- ArrowUpRight/Left, ArrowDownRight/Left
- CornerUpRight/Left, CornerDownRight/Left
- TrendingUp/Down
- Forward/Rewind
- Skip Forward/Back

**Icons that should NOT flip:**
- Check, X, Plus, Minus
- Upload, Download
- Settings, Search
- User, Mail
- Calendar, Clock

### Forms

**Keep certain inputs LTR** even in RTL context:

```tsx
import { getInputDirection, getInputTextClass } from '@/shared/utils/rtl';

// ✅ Correct
<input
  type="email"
  dir={getInputDirection('email')} // 'ltr'
  className={getInputTextClass('email')} // 'text-left'
/>

<input
  type="text"
  dir={getInputDirection('text')} // 'rtl'
  className={getInputTextClass('text')} // 'text-right'
/>

// ❌ Avoid
<input type="email" /> // Will be RTL, confusing for email addresses
```

**LTR Input Types:**
- email
- url
- tel
- number
- password

---

## Typography & Language

### Arabic Text Quality

**Professional Tone:**
```
✅ "يرجى إدخال البريد الإلكتروني" (Please enter email)
❌ "ادخل الايميل" (Informal/transliteration)

✅ "تم حفظ التغييرات بنجاح" (Changes saved successfully)
❌ "تمام، اتحفظ" (Too casual)
```

**Consistency:**
- Use Modern Standard Arabic (MSA), not dialect
- Avoid mixing Arabic and English unnecessarily
- Keep technical terms consistent (e.g., always "بريد إلكتروني" not "إيميل")

### Pluralization

Arabic has specific plural rules:

```typescript
import { pluralize, formatStudentCount } from '@/shared/utils/formatting';

// ✅ Correct
formatStudentCount(1) // "طالب واحد"
formatStudentCount(2) // "طالبان"
formatStudentCount(10) // "10 طلاب"

// ❌ Avoid
`${count} طالب` // Grammatically incorrect for count > 1
```

### Text Truncation

```typescript
import { truncateText } from '@/shared/utils/formatting';

// ✅ Correct
truncateText("مرحبا بكم في المنصة التعليمية", 15) // "مرحبا بكم في..."

// ❌ Avoid
text.slice(0, 15) + '...' // May cut mid-word
```

---

## Accessibility

### ARIA Labels

**Always provide Arabic ARIA labels:**

```tsx
import { getAriaProps, getFormFieldAriaProps } from '@/shared/utils/accessibility';

// ✅ Correct
<button {...getAriaProps('button', 'حذف العنصر', { pressed: false })}>
  حذف
</button>

<input {...getFormFieldAriaProps('email', 'البريد الإلكتروني', {
  required: true,
  error: 'البريد الإلكتروني مطلوب'
})} />

// ❌ Avoid
<button aria-label="Delete"> // English label in Arabic interface
```

### Keyboard Navigation

**Implement keyboard shortcuts:**

```tsx
import { handleActivationKeys, getKeyboardNavHandler } from '@/shared/utils/accessibility';

// ✅ Correct - Custom button with keyboard support
<div
  role="button"
  tabIndex={0}
  onKeyDown={handleActivationKeys(() => handleClick())}
  onClick={handleClick}
>
  إجراء
</div>

// ✅ Correct - List navigation
const handler = getKeyboardNavHandler(items, currentIndex, setCurrentIndex);
<div onKeyDown={handler}>...</div>
```

### Focus Management

**Manage focus for modals and dialogs:**

```tsx
import { createFocusTrap } from '@/shared/utils/accessibility';

useEffect(() => {
  if (isOpen && modalRef.current) {
    const trap = createFocusTrap(modalRef.current);
    trap.activate();
    return () => trap.deactivate();
  }
}, [isOpen]);
```

### Screen Reader Announcements

```tsx
import { announceToScreenReader } from '@/shared/utils/accessibility';

const handleSave = async () => {
  await saveCourse();
  announceToScreenReader('تم حفظ الدورة بنجاح', 'polite');
};
```

### Color Contrast

**Ensure WCAG AA compliance (4.5:1 ratio):**

```typescript
import { hasGoodContrast } from '@/shared/utils/accessibility';

// ✅ Verify contrast
const textColor = '#1a1a1a';
const bgColor = '#ffffff';

if (!hasGoodContrast(textColor, bgColor, 'AA')) {
  console.warn('Insufficient color contrast');
}
```

### Skip Links

**Provide skip navigation for keyboard users:**

```tsx
import { getSkipLinkProps } from '@/shared/utils/accessibility';

<a {...getSkipLinkProps('التخطي إلى المحتوى الرئيسي', '#main-content')}>
  التخطي إلى المحتوى
</a>
```

---

## Component Guidelines

### Buttons

```tsx
// ✅ Complete button with accessibility
<button
  type="button"
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={loading}
  aria-label="حفظ التغييرات"
  aria-busy={loading}
>
  {loading ? 'جاري الحفظ...' : 'حفظ'}
</button>
```

### Forms

```tsx
import { generateFormFieldIds, getFormFieldA11yProps } from '@/shared/utils/accessibility';

const EmailField = ({ error }) => {
  const props = getFormFieldA11yProps('email', 'البريد الإلكتروني', {
    required: true,
    error,
  });

  return (
    <div>
      <label {...props.label} className="block text-sm font-medium text-gray-700 mb-2">
        البريد الإلكتروني <span className="text-red-600">*</span>
      </label>
      <input
        {...props.input}
        type="email"
        dir="ltr"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && (
        <p {...props.error} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
```

### Modals

```tsx
import { getModalAriaProps, handleEscapeKey, createFocusTrap } from '@/shared/utils/accessibility';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleEsc = handleEscapeKey(onClose);
      document.addEventListener('keydown', handleEsc);

      if (modalRef.current) {
        const trap = createFocusTrap(modalRef.current);
        trap.activate();
        return () => {
          trap.deactivate();
          document.removeEventListener('keydown', handleEsc);
        };
      }
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        {...getModalAriaProps(title)}
        className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full m-4"
      >
        <h2 id="modal-title" className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <div>{children}</div>
      </div>
    </div>
  );
};
```

### Tables

```tsx
import { getTableHeaderClass, getTableCellAlign } from '@/shared/utils/rtl';

<table className="w-full" dir="rtl">
  <thead className="bg-gray-50 border-b">
    <tr>
      <th className={`px-6 py-4 text-sm font-semibold ${getTableHeaderClass()}`}>
        الاسم
      </th>
      <th className={`px-6 py-4 text-sm font-semibold ${getTableHeaderClass()}`}>
        البريد
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className={`px-6 py-4 text-${getTableCellAlign()}`}>
        محمد أحمد
      </td>
      <td className={`px-6 py-4 text-${getTableCellAlign()}`} dir="ltr">
        [email protected]
      </td>
    </tr>
  </tbody>
</table>
```

---

## Testing Checklist

### Visual Testing

- [ ] All text is in Arabic
- [ ] All text is properly aligned (right-aligned)
- [ ] Icons are flipped where appropriate
- [ ] Margins and paddings are correctly flipped
- [ ] Forms layout correctly in RTL
- [ ] Tables display correctly in RTL
- [ ] Modal/dialog positions are correct
- [ ] Dropdowns and menus open in correct direction

### Functional Testing

- [ ] All dates format correctly in Arabic
- [ ] All currency formats correctly with EGP
- [ ] Numbers use thousand separators
- [ ] Relative time displays correctly ("منذ ساعة")
- [ ] Forms validate correctly
- [ ] Error messages are in Arabic
- [ ] Success messages are in Arabic

### Accessibility Testing

- [ ] Tab navigation works correctly
- [ ] Focus indicators are visible
- [ ] ARIA labels are in Arabic
- [ ] Screen reader announces in Arabic
- [ ] Skip links work
- [ ] Keyboard shortcuts work
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Forms can be completed with keyboard only
- [ ] Modals trap focus correctly
- [ ] Error messages are announced to screen readers

### Browser Testing

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Screen Reader Testing

Test with:
- [ ] NVDA (Windows) - Arabic voice
- [ ] VoiceOver (macOS/iOS) - Arabic voice
- [ ] TalkBack (Android) - Arabic voice

---

## Common Mistakes to Avoid

### ❌ Hard-coded Directions

```tsx
// Bad
<div className="ml-4 pr-6">

// Good
import { getMarginClass, getPaddingClass } from '@/shared/utils/rtl';
<div className={`${getMarginClass('left', 4)} ${getPaddingClass('right', 6)}`}>
```

### ❌ Missing ARIA Labels

```tsx
// Bad
<button onClick={handleDelete}>
  <Trash2 className="h-5 w-5" />
</button>

// Good
<button onClick={handleDelete} aria-label="حذف العنصر">
  <Trash2 className="h-5 w-5" />
</button>
```

### ❌ Inconsistent Number Formatting

```tsx
// Bad
<span>{amount} جنيه</span>
<span>{amount.toString()}</span>
<span>{amount.toLocaleString()}</span>

// Good
import { formatCurrency } from '@/shared/utils/formatting';
<span>{formatCurrency(amount)}</span>
```

### ❌ English in Arabic Context

```tsx
// Bad
<p>يرجى الانتظار... Loading...</p>
<button>Save حفظ</button>

// Good
<p>جاري التحميل...</p>
<button>حفظ</button>
```

### ❌ Wrong Input Direction

```tsx
// Bad - Email in RTL
<input type="email" placeholder="أدخل البريد الإلكتروني" />

// Good - Email in LTR
<input
  type="email"
  dir="ltr"
  className="text-left"
  placeholder="[email protected]"
  aria-label="البريد الإلكتروني"
/>
```

---

## Resources

### Utility Libraries

- `/shared/utils/formatting.ts` - Formatting utilities
- `/shared/utils/rtl.ts` - RTL layout utilities
- `/shared/utils/accessibility.ts` - Accessibility utilities

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Arabic Typography Best Practices](https://www.w3.org/International/articles/typography/arabic.en)
- [RTL Styling Guide](https://rtlstyling.com/)

### Tools

- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Accessibility Tool](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## Version History

- **v1.0** (2025-11-22) - Initial style guide created for Phase 15
