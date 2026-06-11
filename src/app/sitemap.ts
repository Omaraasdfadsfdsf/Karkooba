import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { listingPath, siteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.2 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('listings')
      .select('id, title, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(500);
    for (const l of data ?? []) {
      entries.push({
        url: `${base}${listingPath(l.id, l.title)}`,
        lastModified: new Date(l.created_at),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  } catch {
    // sitemap stays minimal when the database is unreachable
  }

  return entries;
}
