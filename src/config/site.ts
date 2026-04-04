export type SiteLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type SocialLink = SiteLink & {
  rel?: string;
};

const fallbackUrl = 'https://rodocodes.dev';

export const siteConfig = {
  name: 'Rodrigo Alonso',
  role: 'Ingeniero de Software',
  title: 'Rodrigo Alonso | Ingeniero de Software',
  description:
    'Portafolio de Rodrigo Alonso. Ingeniería de software, sistemas interactivos, IA aplicada y experiencias inmersivas construidas con criterio.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl,
  email: 'rodrigo@rodocodes.dev',
  github: 'https://github.com/The-Afalion',
  linkedin: 'https://www.linkedin.com/in/rodrigo-alonso-f/',
  socialHandle: '@rodocodes',
} as const;

export const primaryNavigation: SiteLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Laboratorios', href: '/engineering' },
  { label: 'Ajedrez', href: '/chess' },
  { label: 'Modelos 3D', href: '/modelos' },
  { label: 'Contacto', href: '/contact' },
];

export const footerNavigation: SiteLink[] = [
  { label: 'Blog', href: '/blog' },
  { label: 'Laboratorios', href: '/engineering' },
  { label: 'Ajedrez', href: '/chess' },
  { label: 'Modelos 3D', href: '/modelos' },
  { label: 'Contacto', href: '/contact' },
];

export const socialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    href: siteConfig.github,
    external: true,
    rel: 'noopener noreferrer',
  },
  {
    label: 'LinkedIn',
    href: siteConfig.linkedin,
    external: true,
    rel: 'noopener noreferrer',
  },
  {
    label: 'Email',
    href: `mailto:${siteConfig.email}`,
    external: true,
    rel: 'noopener noreferrer',
  },
];

export const sitemapRoutes = [
  '/',
  '/blog',
  '/engineering',
  '/chess',
  '/algorithms',
  '/physics',
  '/modelos',
  '/contact',
  '/slalom',
  '/sonic',
  '/urban',
  '/chrono-dasher',
  '/pi-vault',
] as const;

function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const chromeHiddenPrefixes = ['/admin', '/login', '/signup', '/blog/login'] as const;
const footerHiddenPrefixes = ['/admin', '/login', '/signup', '/blog/login', '/nexus'] as const;
const newsletterHiddenPrefixes = [
  '/admin',
  '/login',
  '/signup',
  '/blog/login',
  '/chess',
  '/nexus',
  '/slalom/editor',
] as const;
const chatEnabledPrefixes = ['/chess', '/nexus'] as const;

export function shouldShowHeader(pathname: string) {
  return pathname === '/';
}

export function shouldShowFooter(pathname: string) {
  return !matchesPrefix(pathname, footerHiddenPrefixes);
}

export function shouldShowNewsletter(pathname: string) {
  return !matchesPrefix(pathname, newsletterHiddenPrefixes);
}

export function shouldShowChat(pathname: string) {
  return matchesPrefix(pathname, chatEnabledPrefixes);
}

export function shouldEnableHomeEffects(pathname: string) {
  return pathname === '/';
}

export function shouldUsePlainShell(pathname: string) {
  return matchesPrefix(pathname, chromeHiddenPrefixes);
}
