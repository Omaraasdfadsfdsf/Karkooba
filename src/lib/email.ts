/**
 * Transactional email via Resend (https://resend.com — free tier is plenty).
 * Quietly does nothing when RESEND_API_KEY isn't configured, so the app
 * works without it; you just don't get email notifications.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'KARKOOBA <onboarding@resend.dev>',
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      console.error('Email send failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Email send failed:', err);
  }
}
