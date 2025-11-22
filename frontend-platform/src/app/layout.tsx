import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'منصة الأكاديمية - أنشئ أكاديميتك التعليمية الإلكترونية',
  description:
    'منصة متكاملة لإنشاء وإدارة الأكاديميات التعليمية الإلكترونية باللغة العربية مع نظام دفع متكامل وإدارة الطلاب',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased">{children}</body>
    </html>
  );
}
