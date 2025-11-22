import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h1 className="mb-8 text-4xl font-bold">سياسة الخصوصية</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>

              <div className="prose prose-gray max-w-none space-y-6">
                <section>
                  <h2 className="mb-4 text-2xl font-semibold">1. المقدمة</h2>
                  <p className="text-muted-foreground">
                    نحن في منصة الأكاديمية نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح
                    سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك
                    لمنصتنا.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">2. المعلومات التي نجمعها</h2>
                  <p className="mb-2 text-muted-foreground">نقوم بجمع الأنواع التالية من المعلومات:</p>
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>
                      <strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، كلمة المرور
                      (مشفرة)
                    </li>
                    <li>
                      <strong>معلومات الأكاديمية:</strong> اسم الأكاديمية، الشعار، الوصف
                    </li>
                    <li>
                      <strong>معلومات الدفع:</strong> تفاصيل المعاملات (لا نحفظ معلومات البطاقة)
                    </li>
                    <li>
                      <strong>معلومات الاستخدام:</strong> سجل النشاط، الصفحات المزارة، الوقت المستغرق
                    </li>
                    <li>
                      <strong>معلومات تقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">3. كيفية استخدام المعلومات</h2>
                  <p className="mb-2 text-muted-foreground">نستخدم معلوماتك للأغراض التالية:</p>
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>توفير وتحسين خدماتنا</li>
                    <li>معالجة المعاملات والمدفوعات</li>
                    <li>التواصل معك بشأن حسابك</li>
                    <li>إرسال إشعارات وتحديثات مهمة</li>
                    <li>تحليل استخدام المنصة وتحسين الأداء</li>
                    <li>منع الاحتيال وضمان الأمان</li>
                    <li>الامتثال للمتطلبات القانونية</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">4. مشاركة المعلومات</h2>
                  <p className="mb-2 text-muted-foreground">
                    لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات
                    التالية فقط:
                  </p>
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>
                      <strong>مقدمو الخدمات:</strong> شركات تساعدنا في تشغيل المنصة (استضافة، دفع،
                      إلخ)
                    </li>
                    <li>
                      <strong>المتطلبات القانونية:</strong> عند الطلب من الجهات الحكومية أو
                      القضائية
                    </li>
                    <li>
                      <strong>حماية الحقوق:</strong> لحماية حقوقنا أو حقوق المستخدمين الآخرين
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">5. أمان البيانات</h2>
                  <p className="text-muted-foreground">
                    نطبق إجراءات أمنية صارمة لحماية بياناتك:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                    <li>تشفير SSL/TLS لجميع البيانات المنقولة</li>
                    <li>تشفير كلمات المرور باستخدام bcrypt</li>
                    <li>نسخ احتياطي منتظم للبيانات</li>
                    <li>قيود الوصول للموظفين المصرح لهم فقط</li>
                    <li>مراقبة مستمرة للأنشطة المشبوهة</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">6. ملفات تعريف الارتباط (Cookies)</h2>
                  <p className="text-muted-foreground">
                    نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في ملفات
                    تعريف الارتباط من خلال إعدادات متصفحك. ملفات تعريف الارتباط الضرورية لا يمكن
                    تعطيلها حيث أنها مطلوبة لتشغيل المنصة.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">7. حقوقك</h2>
                  <p className="mb-2 text-muted-foreground">لديك الحقوق التالية فيما يتعلق ببياناتك:</p>
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>الوصول إلى بياناتك الشخصية</li>
                    <li>تصحيح البيانات غير الدقيقة</li>
                    <li>حذف بياناتك (في حالات معينة)</li>
                    <li>تقييد معالجة بياناتك</li>
                    <li>نقل بياناتك إلى خدمة أخرى</li>
                    <li>الاعتراض على معالجة بياناتك</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">8. الاحتفاظ بالبيانات</h2>
                  <p className="text-muted-foreground">
                    نحتفظ بمعلوماتك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. بعد حذف
                    حسابك، قد نحتفظ ببعض المعلومات للامتثال للمتطلبات القانونية أو لحل النزاعات.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">9. خصوصية الأطفال</h2>
                  <p className="text-muted-foreground">
                    منصتنا ليست موجهة للأطفال دون سن 18 عاماً. لا نجمع عن قصد معلومات شخصية من
                    الأطفال. إذا علمنا أننا جمعنا معلومات من طفل، سنحذفها فوراً.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">10. التعديلات على السياسة</h2>
                  <p className="text-muted-foreground">
                    قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر
                    البريد الإلكتروني أو من خلال إشعار على المنصة. ننصحك بمراجعة هذه السياسة
                    بشكل دوري.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-semibold">11. الاتصال بنا</h2>
                  <p className="text-muted-foreground">
                    إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية أو ممارساتنا، يُرجى
                    التواصل معنا عبر:
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    البريد الإلكتروني: privacy@academy-platform.com
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
