'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be connected to EmailModule in Phase 9
    console.log('Contact form submitted:', formData);
    alert('شكراً لتواصلك معنا! سنرد عليك قريباً.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">تواصل معنا</h1>
              <p className="text-lg text-muted-foreground">
                نحن هنا لمساعدتك. لا تتردد في التواصل معنا بأي استفسار
              </p>
            </div>
          </Container>
        </section>

        {/* Contact */}
        <section className="py-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div>
                <h2 className="mb-6 text-2xl font-bold">أرسل لنا رسالة</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">الاسم</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">الموضوع</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">الرسالة</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    إرسال الرسالة
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="mb-6 text-2xl font-bold">معلومات التواصل</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>البريد الإلكتروني</CardTitle>
                    <CardDescription>info@academy-platform.com</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>الهاتف</CardTitle>
                    <CardDescription>+966 XX XXX XXXX</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>العنوان</CardTitle>
                    <CardDescription>
                      الرياض، المملكة العربية السعودية
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>ساعات العمل</CardTitle>
                    <CardDescription>
                      الأحد - الخميس: 9:00 ص - 5:00 م
                      <br />
                      الجمعة - السبت: مغلق
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="bg-muted/50 py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-12 text-center text-3xl font-bold">أسئلة شائعة</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">كم يستغرق الرد على الاستفسارات؟</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      نحن نرد على جميع الاستفسارات خلال 24 ساعة في أيام العمل.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">هل يوجد دعم فني مباشر؟</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      نعم، نوفر دعم فني عبر البريد الإلكتروني والدردشة المباشرة.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">كيف يمكنني حجز عرض توضيحي؟</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      يمكنك طلب عرض توضيحي عبر ملء النموذج أعلاه أو التواصل معنا مباشرة.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
