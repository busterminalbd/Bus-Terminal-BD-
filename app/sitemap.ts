import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://busterminalbd.com';

  const routes = [
    '',
    '/buses',
    '/operators',
    '/routes',
    '/districts',
    '/fares',
    '/counters',
    '/mini-coaches',
    '/tours',
    '/booking',
    '/search',
    '/contact',
    '/about',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
