import { MetadataRoute } from 'next';
import { getMasterStudies, getSynthesisSlugs } from '@/lib/science';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://openscg.org';
  const today = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/science`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Science Hub studies
  const studies = await getMasterStudies();
  const studyRoutes: MetadataRoute.Sitemap = studies
    .filter((study) => study.slug && study.slug.trim() !== '')
    .map((study) => ({
      url: `${baseUrl}/science/studies/${study.slug}`,
      // Use year as fallback if updatedAt is missing
      lastModified: study.year ? new Date(`${study.year}-01-01`) : today,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  // Science Hub synthesis pages
  const synthesisSlugs = await getSynthesisSlugs();
  const synthesisRoutes: MetadataRoute.Sitemap = synthesisSlugs.map((slug) => ({
    url: `${baseUrl}/science/synthesis/${slug}`,
    lastModified: today,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...studyRoutes, ...synthesisRoutes];
}
