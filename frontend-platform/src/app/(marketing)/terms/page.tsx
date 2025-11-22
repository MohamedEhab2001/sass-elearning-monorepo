import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h1 className="mb-8 text-4xl font-bold">شروط الاستخدام</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>

              <div className="prose prose-gray max-w-none space-y-6">
                <section>
                  <h2 className="mb-4 text-2xl font-semibold">1. القبول بالشروط</h2>
                  <p className="text-muted-foreground">
                    باستخدامك لمنصة الأكاديمية، فإنك توافق على الالتزام بشروط الاستخدام هذه.
                    إذا كنت لا توافق على أي جزء من هذه الشروط، يُرجى عدم استخدام المنصة.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">2. استخدام المنصة</h2>
                  <p className="mb-2 text-muted-foreground">تلتزم بما يلي عند استخدام المنصة:</p>
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>استخدام المنصة للأغراض المشروعة فقط</li>
                    <li>عدم انتهاك حقوق الملكية الفكرية</li>
                    <li>عدم نشر محتوى مسيء أو غير قانوني</li>
                    <li>عدم محاولة اختراق أو إضرار المنصة</li>
                    <li>الحفاظ على سرية معلومات تسجيل الدخول</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">3. حسابات المستخدمين</h2>
                  <p className="text-muted-foreground">
                    أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور. تتحمل المسؤولية الكاملة عن
                    جميع الأنشطة التي تتم تحت حسابك. يجب عليك إخطارنا فوراً بأي استخدام غير
                    مصرح به لحسابك.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">4. المحتوى والملكية الفكرية</h2>
                  <p className="mb-2 text-muted-foreground">
                    المحتوى الذي تقوم بإنشائه ونشره على المنصة يظل ملكاً لك. ومع ذلك، فإنك تمنحنا
                    ترخيصاً غير حصري لاستخدام هذا المحتوى لتشغيل وتحسين المنصة.
                  </p>
                  <p className="text-muted-foreground">
                    جميع حقوق الملكية الفكرية للمنصة نفسها (التصميم، الكود، الشعار) محفوظة لنا.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">5. المدفوعات والعمولات</h2>
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>نحن نتقاضى عمولة على المبيعات حسب الباقة المختارة</li>
                    <li>جميع الأسعار بالدولار الأمريكي ما لم يُذكر خلاف ذلك</li>
                    <li>يتم احتساب العمولة تلقائياً من كل عملية بيع</li>
                    <li>يمكنك طلب سحب أرباحك في أي وقت</li>
                    <li>نقوم بمعالجة طلبات السحب خلال 3-5 أيام عمل</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">6. إنهاء الحساب</h2>
                  <p className="text-muted-foreground">
                    يمكنك إنهاء حسابك في أي وقت من خلال لوحة التحكم. نحتفظ بالحق في تعليق أو
                    إنهاء حسابك إذا انتهكت هذه الشروط أو إذا تم استخدام حسابك بطريقة غير قانونية
                    أو ضارة.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">7. إخلاء المسؤولية</h2>
                  <p className="text-muted-foreground">
                    نوفر المنصة "كما هي" دون أي ضمانات صريحة أو ضمنية. لا نضمن أن المنصة ستكون
                    خالية من الأخطاء أو متاحة بشكل مستمر. لا نتحمل المسؤولية عن أي خسائر مباشرة
                    أو غير مباشرة ناتجة عن استخدام المنصة.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">8. القانون المطبق</h2>
                  <p className="text-muted-foreground">
                    تخضع هذه الشروط وتفسر وفقاً لقوانين المملكة العربية السعودية. أي نزاع ينشأ عن
                    هذه الشروط يُحال إلى المحاكم المختصة في المملكة.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">9. التعديلات على الشروط</h2>
                  <p className="text-muted-foreground">
                    نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطارك بأي تغييرات جوهرية
                    عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرارك في استخدام المنصة
                    بعد التعديلات يُعتبر قبولاً للشروط المعدلة.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">10. الاتصال بنا</h2>
                  <p className="text-muted-foreground">
                    إذا كان لديك أي أسئلة حول شروط الاستخدام، يُرجى التواصل معنا عبر:
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    البريد الإلكتروني: legal@academy-platform.com
                  </p>
                </section>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
