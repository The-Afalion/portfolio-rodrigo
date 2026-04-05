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
  role: 'Ingeniero de software',
  title: 'Rodrigo Alonso | Ingeniero de software',
  description:
    'Portfolio de Rodrigo Alonso. Producto digital, sistemas interactivos, IA aplicada y prototipos técnicos.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl,
  email: 'rodrigo@rodocodes.dev',
  github: 'https://github.com/The-Afalion',
  linkedin: 'https://www.linkedin.com/in/rodrigo-alonso-f/',
  socialHandle: '@rodocodes',
} as const;

export const primaryNavigation: SiteLink[] = [
  { label: 'Portfolio', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Laboratorios', href: '/engineering' },
  { label: 'Chess', href: '/chess' },
  { label: '3D', href: '/modelos' },
  { label: 'Contacto', href: '/contact' },
];

export const footerNavigation: SiteLink[] = [
  { label: 'Portfolio', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Laboratorios', href: '/engineering' },
  { label: 'Chess', href: '/chess' },
  { label: '3D', href: '/modelos' },
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

const immersivePrefixes = [
  '/engineering',
  '/nexus',
  '/slalom',
  '/chess/play',
] as const;
const chromeHiddenPrefixes = [
  '/admin',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/blog/login',
  ...immersivePrefixes,
] as const;
const footerHiddenPrefixes = [
  '/admin',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/blog/login',
  ...immersivePrefixes,
] as const;
const newsletterHiddenPrefixes = [
  '/admin',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/blog/login',
  '/chess',
  '/nexus',
  '/slalom/editor',
] as const;
const chatEnabledPrefixes = ['/chess', '/nexus'] as const;

export function shouldShowHeader(pathname: string) {
  return !matchesPrefix(pathname, chromeHiddenPrefixes);
}

export function shouldShowFooter(pathname: string) {
  return !matchesPrefix(pathname, footerHiddenPrefixes);
}

export function shouldShowNewsletter(pathname: string) {
  return !matchesPrefix(pathname, newsletterHiddenPrefixes) && false;
}

export function shouldShowChat(pathname: string) {
  if (pathname.startsWith('/chess/play/')) {
    return false;
  }

  return matchesPrefix(pathname, chatEnabledPrefixes);
}

export function shouldEnableHomeEffects(pathname: string) {
  return false;
}

export function shouldUsePlainShell(pathname: string) {
  return matchesPrefix(pathname, chromeHiddenPrefixes);
}
