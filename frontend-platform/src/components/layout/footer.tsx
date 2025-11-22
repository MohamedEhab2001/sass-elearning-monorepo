import Link from 'next/link';
import { Container } from '@/components/ui/container';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <Container>
        <div className="grid gap-8 py-12 md:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-s-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-xl font-bold">أ</span>
              </div>
              <span className="text-lg font-bold">منصة الأكاديمية</span>
            </div>
            <p className="text-sm text-muted-foreground">
              منصة متكاملة لإنشاء وإدارة الأكاديميات التعليمية الإلكترونية باللغة العربية
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-foreground">
                  المزايا
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  الأسعار
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">قانوني</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>info@academy-platform.com</li>
              <li>+966 XX XXX XXXX</li>
              <li>الرياض، المملكة العربية السعودية</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} منصة الأكاديمية. جميع الحقوق محفوظة.
          </p>
        </div>
      </Container>
    </footer>
  );
}
