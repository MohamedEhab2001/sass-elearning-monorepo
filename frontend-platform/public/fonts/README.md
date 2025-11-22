# Cairo Font Setup

## Download Cairo Font

Download the Cairo font family from Google Fonts:
https://fonts.google.com/specimen/Cairo

## Required Files

Place the following font files in this directory:

```
public/fonts/
├── Cairo-Bold.ttf
├── Cairo-SemiBold.ttf
├── Cairo-Medium.ttf
├── Cairo-Regular.ttf
└── Cairo-Light.ttf
```

## Usage in Next.js

The font is configured in `src/app/layout.tsx` using next/font:

```typescript
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});
```

## Alternative: Using Google Fonts CDN

If you prefer using Google Fonts CDN instead of local files, add this to your layout:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

Note: For production, it's recommended to self-host fonts for better performance.
