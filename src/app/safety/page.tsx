import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Safety Tips' };

const content = {
  en: {
    title: 'Safety Tips',
    updated: 'Simple habits that keep secondhand trading safe.',
    sections: [
      {
        h: 'Meet in public places',
        p: 'Metro stations, mall entrances, and busy cafés are ideal. For bulky furniture, bring a friend along to the pickup.',
      },
      {
        h: 'Inspect before you pay',
        p: 'Turn it on, plug it in, sit on it — whatever applies. Honest sellers expect this. The condition label on a listing is a guide, not a guarantee.',
      },
      {
        h: 'Pay on collection, in cash or instant transfer',
        p: 'Never send deposits or "reservation fees" before seeing the item. KARKOOBA never asks for payments, and no listing requires advance payment.',
      },
      {
        h: 'Keep the conversation on KARKOOBA',
        p: 'Our chat keeps a record of what was agreed. Be cautious with anyone who immediately pushes for off-platform payment links.',
      },
      {
        h: 'Watch for red flags',
        p: 'Prices too good to be true, urgency pressure ("pay now or it goes to someone else"), refusal to meet in person, and requests for your card details or OTP codes are classic scam patterns.',
      },
      {
        h: 'Report problems',
        p: 'If a listing or user looks fraudulent, stop responding and report it to us. We remove bad actors quickly.',
      },
    ],
  },
  ar: {
    title: 'نصائح الأمان',
    updated: 'عادات بسيطة تجعل تجارة المستعمل آمنة.',
    sections: [
      {
        h: 'قابل البائع في مكان عام',
        p: 'محطات المترو ومداخل المراكز التجارية والمقاهي المزدحمة أماكن مثالية. وللأثاث الكبير، اصطحب صديقاً عند الاستلام.',
      },
      {
        h: 'افحص قبل أن تدفع',
        p: 'شغّله، وصّله بالكهرباء، اجلس عليه — حسب طبيعة الغرض. البائع الصادق يتوقع ذلك. تصنيف الحالة في الإعلان دليل إرشادي وليس ضماناً.',
      },
      {
        h: 'ادفع عند الاستلام نقداً أو بتحويل فوري',
        p: 'لا ترسل عربوناً أو "رسوم حجز" قبل رؤية الغرض. كركوبة لا تطلب أي مدفوعات أبداً، ولا يتطلب أي إعلان دفعاً مسبقاً.',
      },
      {
        h: 'أبقِ المحادثة داخل كركوبة',
        p: 'محادثاتنا تحفظ سجلاً لما تم الاتفاق عليه. كن حذراً من أي شخص يستعجل تحويلك إلى روابط دفع خارجية.',
      },
      {
        h: 'انتبه لعلامات الخطر',
        p: 'الأسعار المغرية بشكل غير معقول، والضغط بالاستعجال ("ادفع الآن وإلا بعته لغيرك")، ورفض اللقاء شخصياً، وطلب بيانات بطاقتك أو رموز التحقق — كلها أنماط احتيال معروفة.',
      },
      {
        h: 'أبلغ عن المشاكل',
        p: 'إذا بدا إعلان أو مستخدم مريباً، توقف عن الرد وأبلغنا. نزيل المسيئين بسرعة.',
      },
    ],
  },
};

export default async function SafetyPage() {
  const { locale } = await getDict();
  const c = content[locale];
  return (
    <div className="panel-wrap">
      <div className="panel wide">
        <h1>{c.title}</h1>
        <p className="sub">{c.updated}</p>
        {c.sections.map((s) => (
          <div key={s.h} style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: '1rem', marginBottom: 6 }}>{s.h}</h2>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text)' }}>{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
