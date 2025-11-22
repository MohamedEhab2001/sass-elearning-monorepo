import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                أنشئ أكاديميتك التعليمية الإلكترونية في دقائق
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                منصة متكاملة لإنشاء وإدارة الأكاديميات التعليمية الإلكترونية باللغة العربية مع نظام دفع
                متكامل وإدارة شاملة للطلاب والدورات
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="xl">ابدأ مجاناً الآن</Button>
                </Link>
                <Link href="/features">
                  <Button size="xl" variant="outline">
                    اكتشف المزايا
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">لماذا منصة الأكاديمية؟</h2>
              <p className="text-lg text-muted-foreground">
                كل ما تحتاجه لإطلاق وإدارة أكاديميتك التعليمية بنجاح
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>منصة متعددة المستأجرين</CardTitle>
                  <CardDescription>
                    أنشئ أكاديميتك الخاصة بعلامتك التجارية مع عزل كامل للبيانات
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الدورات</CardTitle>
                  <CardDescription>
                    أنشئ وأدر دوراتك بسهولة مع دعم الفيديو والملفات والنصوص
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>نظام الامتحانات</CardTitle>
                  <CardDescription>
                    امتحانات متنوعة مع تصحيح تلقائي ويدوي وتقارير مفصلة
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>نظام الدفع</CardTitle>
                  <CardDescription>
                    مدمج مع بوابة الدفع Paymob لقبول المدفوعات بسهولة
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>الاشتراكات</CardTitle>
                  <CardDescription>
                    خطط اشتراك شهرية وسنوية مع تجديد تلقائي
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>تقارير وإحصائيات</CardTitle>
                  <CardDescription>
                    لوحة تحكم شاملة لمتابعة الطلاب والإيرادات والأداء
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Container>
        </section>

        {/* Pricing Preview */}
        <section className="bg-muted/50 py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">أسعار تناسب الجميع</h2>
              <p className="text-lg text-muted-foreground">
                اختر الباقة المناسبة لحجم أكاديميتك ونموها
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>البداية</CardTitle>
                  <CardDescription>للمدربين الجدد</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">20%</span>
                    <span className="text-muted-foreground"> عمولة</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>حتى $10,000 إيرادات</span>
                    </li>
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>دورات غير محدودة</span>
                    </li>
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>طلاب غير محدودين</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <div className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                    الأكثر شعبية
                  </div>
                  <CardTitle>النمو</CardTitle>
                  <CardDescription>للأكاديميات المتنامية</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">15%</span>
                    <span className="text-muted-foreground"> عمولة</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>من $10,001 إلى $50,000</span>
                    </li>
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>كل مزايا البداية</span>
                    </li>
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>دعم أولوية</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>الاحترافية</CardTitle>
                  <CardDescription>للأكاديميات الكبيرة</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">10%</span>
                    <span className="text-muted-foreground"> عمولة</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>أكثر من $50,000</span>
                    </li>
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>كل مزايا النمو</span>
                    </li>
                    <li className="flex items-start">
                      <span className="me-2">✓</span>
                      <span>دعم مخصص 24/7</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 text-center">
              <Link href="/pricing">
                <Button variant="outline">عرض جميع المزايا</Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">ماذا يقول عملاؤنا</h2>
              <p className="text-lg text-muted-foreground">
                انضم إلى مئات المدربين الذين أطلقوا أكاديمياتهم بنجاح
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4 text-muted-foreground">
                    "منصة رائعة ساعدتني في إطلاق أكاديميتي بسرعة وسهولة. نظام الدفع والاشتراكات
                    يعمل بشكل ممتاز."
                  </p>
                  <div>
                    <p className="font-semibold">أحمد محمد</p>
                    <p className="text-sm text-muted-foreground">مدرب برمجة</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4 text-muted-foreground">
                    "أفضل منصة عربية للتعليم الإلكتروني. الدعم الفني ممتاز والمزايا كاملة."
                  </p>
                  <div>
                    <p className="font-semibold">فاطمة السعيد</p>
                    <p className="text-sm text-muted-foreground">مدربة تصميم</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4 text-muted-foreground">
                    "ساعدتني المنصة في مضاعفة إيراداتي من الدورات. نظام التقارير والإحصائيات
                    مفيد جداً."
                  </p>
                  <div>
                    <p className="font-semibold">خالد عبدالله</p>
                    <p className="text-sm text-muted-foreground">مدرب تسويق</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 text-primary-foreground">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold">جاهز لإطلاق أكاديميتك؟</h2>
              <p className="mb-8 text-lg opacity-90">
                انضم إلى مئات المدربين الذين اختاروا منصة الأكاديمية لإطلاق أكاديمياتهم التعليمية
              </p>
              <Link href="/signup">
                <Button size="xl" variant="secondary">
                  ابدأ مجاناً الآن
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
