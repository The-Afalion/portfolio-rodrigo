import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rodocodes.dev';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/modelos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
