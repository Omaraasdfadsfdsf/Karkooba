import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Privacy Policy' };

const content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 2026',
    sections: [
      {
        h: '1. What we collect',
        p: 'Account data (email, password — stored hashed), profile data (display name, WhatsApp number, emirate), the listings and photos you post, and the messages you exchange with other users. We also keep standard technical logs (IP address, browser type) for security.',
      },
      {
        h: '2. How we use it',
        p: 'To operate the marketplace: showing your listings to buyers, enabling chat, displaying your display name and emirate on your public seller profile, and sending you notification emails about messages you receive. We do not sell your personal data.',
      },
      {
        h: '3. What other users see',
        p: 'Your display name, emirate, join date, and your active listings are public. Your WhatsApp number is shown only on your listings as a contact option. Your email address is never shown to other users.',
      },
      {
        h: '4. Where data lives',
        p: 'Data is stored with Supabase (database, authentication, and photo storage) and the site is hosted on Vercel. Both apply industry-standard encryption in transit and at rest.',
      },
      {
        h: '5. Cookies',
        p: 'We use only essential cookies: your login session and your language preference. No advertising or cross-site tracking cookies.',
      },
      {
        h: '6. Your rights',
        p: 'You can edit your profile in Settings at any time, delete your listings, and request full account deletion by contacting us — this removes your profile, listings, photos, and messages.',
      },
      {
        h: '7. Contact',
        p: 'For privacy questions or deletion requests, contact us through the platform.',
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: يونيو 2026',
    sections: [
      {
        h: '1. ما نجمعه',
        p: 'بيانات الحساب (البريد الإلكتروني وكلمة المرور — تُخزَّن مشفرة)، وبيانات الملف الشخصي (الاسم الظاهر ورقم الواتساب والإمارة)، والإعلانات والصور التي تنشرها، والرسائل المتبادلة مع المستخدمين. كما نحتفظ بسجلات تقنية قياسية (عنوان IP ونوع المتصفح) لأغراض الأمان.',
      },
      {
        h: '2. كيف نستخدمها',
        p: 'لتشغيل السوق: عرض إعلاناتك للمشترين، وتمكين المحادثات، وإظهار اسمك وإمارتك في ملفك العام كبائع، وإرسال إشعارات بريدية عن الرسائل التي تصلك. لا نبيع بياناتك الشخصية.',
      },
      {
        h: '3. ما يراه المستخدمون الآخرون',
        p: 'اسمك الظاهر وإمارتك وتاريخ انضمامك وإعلاناتك النشطة معلومات عامة. يظهر رقم الواتساب فقط في إعلاناتك كوسيلة تواصل. أما بريدك الإلكتروني فلا يظهر لأي مستخدم.',
      },
      {
        h: '4. أين تُخزَّن البيانات',
        p: 'تُخزَّن البيانات لدى Supabase (قاعدة البيانات والمصادقة وتخزين الصور) ويُستضاف الموقع على Vercel، وكلاهما يطبق التشفير القياسي أثناء النقل والتخزين.',
      },
      {
        h: '5. ملفات تعريف الارتباط',
        p: 'نستخدم الملفات الضرورية فقط: جلسة تسجيل الدخول وتفضيل اللغة. لا نستخدم ملفات تتبع إعلانية أو عبر المواقع.',
      },
      {
        h: '6. حقوقك',
        p: 'يمكنك تعديل ملفك الشخصي من الإعدادات في أي وقت، وحذف إعلاناتك، وطلب حذف الحساب بالكامل بالتواصل معنا — وهذا يزيل ملفك وإعلاناتك وصورك ورسائلك.',
      },
      {
        h: '7. التواصل',
        p: 'لأسئلة الخصوصية أو طلبات الحذف، تواصل معنا عبر المنصة.',
      },
    ],
  },
};

export default async function PrivacyPage() {
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
