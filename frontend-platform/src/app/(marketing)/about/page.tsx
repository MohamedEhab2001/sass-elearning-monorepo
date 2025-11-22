import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const team = [
    {
      name: 'محمد أحمد',
      role: 'المؤسس والرئيس التنفيذي',
      description: 'خبرة 10 سنوات في التعليم الإلكتروني والتكنولوجيا',
    },
    {
      name: 'فاطمة السعيد',
      role: 'مديرة المنتج',
      description: 'متخصصة في تجربة المستخدم والتصميم',
    },
    {
      name: 'خالد عبدالله',
      role: 'المدير التقني',
      description: 'مهندس برمجيات بخبرة 12 عاماً',
    },
    {
      name: 'سارة محمود',
      role: 'مديرة النجاح',
      description: 'متخصصة في دعم العملاء ونجاحهم',
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
              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">من نحن</h1>
              <p className="text-lg text-muted-foreground">
                رؤيتنا هي تمكين المدربين والمعلمين العرب من نشر معرفتهم وبناء أكاديميات ناجحة
              </p>
            </div>
          </Container>
        </section>

        {/* Mission */}
        <section className="py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-3xl font-bold">رسالتنا</h2>
              <p className="mb-4 text-lg text-muted-foreground">
                نؤمن بأن التعليم حق للجميع، وأن كل معلم يستحق منصة قوية لنشر معرفته. لذلك
                أنشأنا منصة الأكاديمية لتكون الحل الشامل لإطلاق وإدارة الأكاديميات التعليمية
                الإلكترونية باللغة العربية.
              </p>
              <p className="mb-4 text-lg text-muted-foreground">
                نسعى لتبسيط عملية إنشاء الأكاديميات التعليمية من خلال توفير جميع الأدوات
                اللازمة في منصة واحدة سهلة الاستخدام، مع دعم كامل للغة العربية وتصميم يتناسب
                مع ثقافتنا.
              </p>
            </div>
          </Container>
        </section>

        {/* Values */}
        <section className="bg-muted/50 py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">قيمنا</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-xl font-semibold">البساطة</h3>
                  <p className="text-muted-foreground">
                    نجعل التكنولوجيا المعقدة بسيطة وسهلة الاستخدام للجميع
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-xl font-semibold">الشفافية</h3>
                  <p className="text-muted-foreground">
                    أسعار واضحة وعادلة بدون رسوم خفية أو مفاجآت
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-xl font-semibold">النجاح المشترك</h3>
                  <p className="text-muted-foreground">ننجح عندما تنجح أكاديميتك وتنمو إيراداتك</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* Team */}
        <section className="py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">فريقنا</h2>
              <p className="text-muted-foreground">
                فريق متخصص ومتحمس لمساعدتك في النجاح
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {team.map((member, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-3xl font-bold text-primary">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">{member.name}</h3>
                    <p className="mb-2 text-sm text-primary">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Stats */}
        <section className="bg-primary py-20 text-primary-foreground">
          <Container>
            <div className="grid gap-8 text-center md:grid-cols-3">
              <div>
                <div className="mb-2 text-4xl font-bold">500+</div>
                <div className="text-lg opacity-90">أكاديمية نشطة</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold">50,000+</div>
                <div className="text-lg opacity-90">طالب مسجل</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold">$2M+</div>
                <div className="text-lg opacity-90">إيرادات المدربين</div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
