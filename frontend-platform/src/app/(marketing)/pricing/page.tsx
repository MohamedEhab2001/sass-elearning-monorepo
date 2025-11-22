import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingPage() {
  const plans = [
    {
      name: 'البداية',
      subtitle: 'للمدربين الجدد',
      commission: '20%',
      revenue: 'حتى $10,000',
      features: [
        'دورات غير محدودة',
        'طلاب غير محدودين',
        'نظام امتحانات كامل',
        'نظام دفع متكامل',
        'أكواد خصم',
        'تقارير وإحصائيات',
        'دعم فني',
        'نطاق فرعي مجاني',
      ],
    },
    {
      name: 'النمو',
      subtitle: 'للأكاديميات المتنامية',
      commission: '15%',
      revenue: 'من $10,001 إلى $50,000',
      popular: true,
      features: [
        'كل مزايا البداية',
        'بناء الصفحات',
        'حقول مخصصة',
        'دعم أولوية',
        'تكامل متقدم',
        'تقارير متقدمة',
        'تخصيص كامل',
        'نطاق مخصص (اختياري)',
      ],
    },
    {
      name: 'الاحترافية',
      subtitle: 'للأكاديميات الكبيرة',
      commission: '10%',
      revenue: 'أكثر من $50,000',
      features: [
        'كل مزايا النمو',
        'دعم مخصص 24/7',
        'مدير حساب مخصص',
        'تدريب مخصص',
        'SLA مضمون',
        'نسخ احتياطي متقدم',
        'تخصيص كامل',
        'تكامل API مخصص',
      ],
    },
  ];

  const comparisonFeatures = [
    { name: 'دورات غير محدودة', starter: true, growth: true, pro: true },
    { name: 'طلاب غير محدودين', starter: true, growth: true, pro: true },
    { name: 'نظام امتحانات', starter: true, growth: true, pro: true },
    { name: 'نظام دفع Paymob', starter: true, growth: true, pro: true },
    { name: 'أكواد خصم', starter: true, growth: true, pro: true },
    { name: 'تقارير أساسية', starter: true, growth: true, pro: true },
    { name: 'نطاق فرعي', starter: true, growth: true, pro: true },
    { name: 'بناء الصفحات', starter: false, growth: true, pro: true },
    { name: 'حقول مخصصة', starter: false, growth: true, pro: true },
    { name: 'تقارير متقدمة', starter: false, growth: true, pro: true },
    { name: 'نطاق مخصص', starter: false, growth: true, pro: true },
    { name: 'دعم أولوية', starter: false, growth: true, pro: true },
    { name: 'دعم مخصص 24/7', starter: false, growth: false, pro: true },
    { name: 'مدير حساب مخصص', starter: false, growth: false, pro: true },
    { name: 'SLA مضمون', starter: false, growth: false, pro: true },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
                أسعار بسيطة وشفافة
              </h1>
              <p className="text-lg text-muted-foreground">
                لا رسوم شهرية - فقط عمولة على مبيعاتك. كلما نجحت، تنخفض العمولة!
              </p>
            </div>
          </Container>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <Container>
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={plan.popular ? 'border-primary shadow-lg' : ''}
                >
                  <CardHeader>
                    {plan.popular && (
                      <div className="mb-2 inline-block self-start rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                        الأكثر شعبية
                      </div>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.subtitle}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.commission}</span>
                      <span className="text-muted-foreground"> عمولة</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.revenue}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="mb-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="me-2 text-primary">✓</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        ابدأ الآن
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Comparison Table */}
        <section className="bg-muted/50 py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">مقارنة المزايا</h2>
              <p className="text-muted-foreground">جميع التفاصيل في مكان واحد</p>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-background">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-start">الميزة</th>
                    <th className="p-4 text-center">البداية</th>
                    <th className="p-4 text-center">النمو</th>
                    <th className="p-4 text-center">الاحترافية</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="p-4">{feature.name}</td>
                      <td className="p-4 text-center">
                        {feature.starter ? (
                          <span className="text-primary">✓</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {feature.growth ? (
                          <span className="text-primary">✓</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {feature.pro ? (
                          <span className="text-primary">✓</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-12 text-center text-3xl font-bold">أسئلة شائعة</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">هل هناك رسوم شهرية؟</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      لا، لا توجد رسوم شهرية. نحن نأخذ فقط عمولة على مبيعاتك الفعلية.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">متى تنخفض العمولة؟</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      تنخفض العمولة تلقائياً عندما تتجاوز إيراداتك الحد المقرر. على سبيل المثال،
                      عند تجاوز $10,000 تنخفض العمولة من 20% إلى 15%.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">هل يمكنني تغيير الباقة؟</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      نعم، يتم الانتقال بين الباقات تلقائياً بناءً على إيراداتك. لا حاجة لأي
                      إجراءات يدوية.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">كيف أستلم أرباحي؟</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      يمكنك طلب سحب أرباحك من لوحة التحكم في أي وقت. نقوم بمعالجة الطلبات
                      خلال 3-5 أيام عمل.
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
