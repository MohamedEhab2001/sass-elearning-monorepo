import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturesPage() {
  const features = [
    {
      title: 'منصة متعددة المستأجرين',
      description:
        'كل مدرب يحصل على أكاديميته الخاصة مع عزل كامل للبيانات. كل أكاديمية لها علامتها التجارية وألوانها وخطوطها الخاصة.',
      items: [
        'رابط فريد لكل أكاديمية (academy.com/a/your-academy)',
        'تخصيص كامل للعلامة التجارية (شعار، ألوان، خطوط)',
        'عزل تام للبيانات بين الأكاديميات',
        'دعم النطاقات المخصصة (اختياري)',
      ],
    },
    {
      title: 'إدارة الدورات والدروس',
      description:
        'أنشئ وأدر دوراتك التعليمية بسهولة مع دعم أنواع متعددة من المحتوى.',
      items: [
        'دروس فيديو مع مشغل متقدم',
        'ملفات PDF ومستندات',
        'دروس نصية مع تنسيق غني',
        'ترتيب الدروس بالسحب والإفلات',
        'دروس مجانية ومدفوعة',
        'نشر وإلغاء نشر الدورات',
      ],
    },
    {
      title: 'نظام الامتحانات المتقدم',
      description: 'نظام امتحانات شامل مع تصحيح تلقائي ويدوي وتقارير مفصلة.',
      items: [
        'أسئلة اختيار من متعدد (MCQ)',
        'أسئلة مقالية',
        'امتحانات مختلطة',
        'تصحيح تلقائي للاختيارات',
        'تصحيح يدوي للأسئلة المقالية',
        'تحديد مدة الامتحان وعدد المحاولات',
        'تقارير تفصيلية للطلاب',
      ],
    },
    {
      title: 'نظام الدفع المتكامل',
      description: 'اقبل المدفوعات بسهولة مع تكامل كامل مع بوابة الدفع Paymob.',
      items: [
        'تكامل مع Paymob',
        'دفع بالبطاقات الائتمانية',
        'المحافظ الإلكترونية',
        'أكواد خصم مرنة',
        'معاملات آمنة ومشفرة',
        'إشعارات الدفع التلقائية',
      ],
    },
    {
      title: 'الاشتراكات الشهرية والسنوية',
      description: 'قدم خطط اشتراك شهرية أو سنوية للوصول الكامل لجميع الدورات.',
      items: [
        'خطط شهرية وسنوية',
        'تجديد تلقائي',
        'إلغاء الاشتراك في أي وقت',
        'إدارة الاشتراكات من لوحة التحكم',
        'خصومات على الاشتراكات السنوية',
      ],
    },
    {
      title: 'تتبع التقدم والإنجازات',
      description: 'تتبع تقدم الطلاب في الدورات والدروس بشكل تلقائي.',
      items: [
        'نسبة الإنجاز التلقائية',
        'تمييز الدروس المكتملة',
        'استئناف من آخر نقطة توقف',
        'تقارير التقدم للمدرب',
      ],
    },
    {
      title: 'إدارة الطلاب',
      description: 'أدر طلابك بكفاءة مع أدوات قوية للتواصل والمتابعة.',
      items: [
        'قائمة شاملة بجميع الطلاب',
        'حقول مخصصة لمعلومات الطلاب',
        'تصفية وتجميع الطلاب',
        'تصدير البيانات',
        'إحصائيات تفصيلية لكل طالب',
      ],
    },
    {
      title: 'نظام العمولات المرن',
      description: 'نظام عمولات متدرج يقل مع زيادة إيراداتك.',
      items: [
        'عمولة 20% حتى $10,000',
        'عمولة 15% من $10,001 إلى $50,000',
        'عمولة 10% لأكثر من $50,000',
        'تقارير شفافة للعمولات',
        'طلبات سحب سهلة',
      ],
    },
    {
      title: 'لوحة تحكم شاملة',
      description: 'لوحة تحكم قوية لمتابعة كل جوانب أكاديميتك.',
      items: [
        'إحصائيات الإيرادات والمبيعات',
        'عدد الطلاب والتسجيلات',
        'أداء الدورات',
        'نسب الإنجاز',
        'رسوم بيانية تفاعلية',
      ],
    },
    {
      title: 'بناء الصفحات',
      description: 'أنشئ صفحة رئيسية مخصصة لأكاديميتك بدون برمجة.',
      items: [
        'محرر سحب وإفلات',
        'أقسام جاهزة ومخصصة',
        'معاينة مباشرة',
        'تصميم متجاوب تلقائياً',
      ],
    },
    {
      title: 'دعم عربي كامل',
      description: 'المنصة مصممة خصيصاً للمحتوى العربي مع دعم RTL كامل.',
      items: [
        'واجهة عربية بالكامل',
        'دعم الكتابة من اليمين لليسار (RTL)',
        'خطوط عربية احترافية',
        'تنسيق التواريخ والأرقام بالعربية',
        'قوالب بريد إلكتروني عربية',
      ],
    },
    {
      title: 'الأمان والخصوصية',
      description: 'نحمي بياناتك وبيانات طلابك بأعلى معايير الأمان.',
      items: [
        'تشفير SSL/TLS',
        'نسخ احتياطي يومي',
        'مصادقة ثنائية (2FA)',
        'سياسة خصوصية واضحة',
        'امتثال لمعايير الأمان',
      ],
    },
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
                مزايا شاملة لأكاديميتك
              </h1>
              <p className="text-lg text-muted-foreground">
                كل ما تحتاجه لإطلاق وإدارة أكاديمية تعليمية إلكترونية ناجحة في مكان واحد
              </p>
            </div>
          </Container>
        </section>

        {/* Features */}
        <section className="py-20">
          <Container>
            <div className="grid gap-8">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {feature.items.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="me-2 mt-1 text-primary">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
