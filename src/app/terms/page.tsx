import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Terms of Use' };

const content = {
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: June 2026',
    sections: [
      {
        h: '1. What KARKOOBA is',
        p: 'KARKOOBA is a classifieds platform that connects private buyers and sellers of secondhand items across the United Arab Emirates. We provide the listing and messaging tools; we are not a party to any transaction, we do not handle payments, and we do not take possession of items.',
      },
      {
        h: '2. Your account',
        p: 'You must provide accurate information when registering, keep your login credentials private, and be at least 18 years old (or have guardian consent). You are responsible for all activity on your account.',
      },
      {
        h: '3. Listings',
        p: 'You may only list items you own and are entitled to sell, priced at AED 999 or below. Listings must be honest — describe flaws openly and use real photos of the actual item. Prohibited: counterfeit goods, weapons, medicines, recalled or unsafe products, stolen property, animals, and anything illegal under UAE law.',
      },
      {
        h: '4. Transactions',
        p: 'Sales are concluded directly between buyer and seller. Inspect items before paying, and pay only on collection. KARKOOBA does not guarantee the condition, authenticity, or legality of listed items and is not responsible for disputes between users.',
      },
      {
        h: '5. Conduct',
        p: 'Use the chat respectfully and only for matters related to listings. Harassment, spam, fraud attempts, and attempts to move users to fraudulent external payment schemes will lead to account suspension.',
      },
      {
        h: '6. Content and removal',
        p: 'We may remove listings or suspend accounts that violate these terms or UAE law, at our discretion and without prior notice. You retain ownership of the content you post and grant us a license to display it on the platform.',
      },
      {
        h: '7. Liability',
        p: 'KARKOOBA is provided "as is". To the maximum extent permitted by law, we are not liable for losses arising from transactions between users, service interruptions, or user-generated content.',
      },
      {
        h: '8. Changes',
        p: 'We may update these terms from time to time. Continued use of the platform after an update constitutes acceptance of the revised terms.',
      },
    ],
  },
  ar: {
    title: 'شروط الاستخدام',
    updated: 'آخر تحديث: يونيو 2026',
    sections: [
      {
        h: '1. ما هي كركوبة',
        p: 'كركوبة منصة إعلانات مبوبة تربط البائعين والمشترين الأفراد للمقتنيات المستعملة في دولة الإمارات العربية المتحدة. نوفر أدوات العرض والمراسلة فقط؛ لسنا طرفاً في أي صفقة، ولا نعالج المدفوعات، ولا نستلم الأغراض.',
      },
      {
        h: '2. حسابك',
        p: 'يجب تقديم معلومات صحيحة عند التسجيل، والحفاظ على سرية بيانات الدخول، وأن يكون عمرك 18 عاماً على الأقل (أو بموافقة ولي الأمر). أنت مسؤول عن كل نشاط يتم عبر حسابك.',
      },
      {
        h: '3. الإعلانات',
        p: 'يمكنك عرض الأغراض التي تملكها ويحق لك بيعها فقط، وبسعر لا يتجاوز 999 درهماً. يجب أن تكون الإعلانات صادقة — اذكر العيوب بوضوح واستخدم صوراً حقيقية للغرض نفسه. يُمنع: السلع المقلدة، الأسلحة، الأدوية، المنتجات المسحوبة أو غير الآمنة، الممتلكات المسروقة، الحيوانات، وأي شيء يخالف قوانين دولة الإمارات.',
      },
      {
        h: '4. المعاملات',
        p: 'تتم عمليات البيع مباشرة بين البائع والمشتري. افحص الغرض قبل الدفع، وادفع عند الاستلام فقط. لا تضمن كركوبة حالة الأغراض المعروضة أو أصالتها أو قانونيتها، وليست مسؤولة عن النزاعات بين المستخدمين.',
      },
      {
        h: '5. السلوك',
        p: 'استخدم المحادثات باحترام ولأغراض تتعلق بالإعلانات فقط. التحرش أو الرسائل المزعجة أو محاولات الاحتيال أو تحويل المستخدمين إلى وسائل دفع خارجية مشبوهة تؤدي إلى إيقاف الحساب.',
      },
      {
        h: '6. المحتوى والإزالة',
        p: 'يحق لنا إزالة الإعلانات أو إيقاف الحسابات المخالفة لهذه الشروط أو لقوانين الدولة، وفق تقديرنا ودون إشعار مسبق. تحتفظ بملكية المحتوى الذي تنشره وتمنحنا ترخيصاً بعرضه على المنصة.',
      },
      {
        h: '7. المسؤولية',
        p: 'تُقدَّم كركوبة "كما هي". وإلى الحد الأقصى الذي يسمح به القانون، لسنا مسؤولين عن الخسائر الناتجة عن المعاملات بين المستخدمين أو انقطاع الخدمة أو المحتوى الذي ينشئه المستخدمون.',
      },
      {
        h: '8. التعديلات',
        p: 'قد نحدّث هذه الشروط من وقت لآخر. استمرارك في استخدام المنصة بعد التحديث يعني قبولك بالشروط المعدلة.',
      },
    ],
  },
};

export default async function TermsPage() {
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
