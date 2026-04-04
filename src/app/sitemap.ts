import { MetadataRoute } from 'next';
import { sitemapRoutes, siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes.map((route) => ({
    url: route === '/' ? siteConfig.siteUrl : `${siteConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/blog' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
