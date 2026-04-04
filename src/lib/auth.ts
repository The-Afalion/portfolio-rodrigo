export type AuthMode = 'signin' | 'signup';
export type AuthAudience = 'general' | 'editor' | 'chess';

type QueryValue = string | string[] | undefined;

const DEFAULT_PATH_BY_AUDIENCE: Record<AuthAudience, string> = {
  general: '/',
  editor: '/admin',
  chess: '/chess',
};

export function getFirstQueryValue(value: QueryValue | null): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function parseAuthMode(value: string | null | undefined): AuthMode {
  return value === 'signup' ? 'signup' : 'signin';
}

export function parseAuthAudience(value: string | null | undefined): AuthAudience {
  if (value === 'editor' || value === 'chess') {
    return value;
  }

  return 'general';
}

export function getDefaultAuthPath(audience: AuthAudience) {
  return DEFAULT_PATH_BY_AUDIENCE[audience];
}

export function sanitizeNextPath(next: string | null | undefined, fallback = '/') {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return fallback;
  }

  return next;
}

export function resolveNextPath(audience: AuthAudience, next: string | null | undefined) {
  return sanitizeNextPath(next, getDefaultAuthPath(audience));
}

export function buildPath(pathname: string, params: Record<string, string | null | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildLoginPath(audience: AuthAudience, next: string | null | undefined) {
  return buildPath('/login', {
    audience,
    next: resolveNextPath(audience, next),
  });
}

export function buildSignupPath(audience: AuthAudience, next: string | null | undefined) {
  return buildPath('/signup', {
    audience,
    next: resolveNextPath(audience, next),
  });
}

export function buildForgotPasswordPath(audience: AuthAudience, next: string | null | undefined) {
  return buildPath('/forgot-password', {
    audience,
    next: resolveNextPath(audience, next),
  });
}

export function buildResetPasswordPath(audience: AuthAudience, next: string | null | undefined) {
  return buildPath('/reset-password', {
    audience,
    next: resolveNextPath(audience, next),
  });
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? '';
}

export function isConfiguredAdminEmail(email?: string | null) {
  const normalizedEmail = normalizeEmail(email);
  const configuredAdminEmails = [
    process.env.ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  ]
    .filter(Boolean)
    .map((value) => normalizeEmail(value));

  return (
    normalizedEmail.endsWith('@rodocodes.dev') ||
    configuredAdminEmails.includes(normalizedEmail)
  );
}

export function resolveSuccessfulAuthPath(
  audience: AuthAudience,
  next: string | null | undefined,
  email?: string | null,
) {
  const resolvedNext = resolveNextPath(audience, next);

  if (next) {
    return resolvedNext;
  }

  if (audience === 'editor') {
    return '/admin';
  }

  if (audience === 'chess') {
    return '/chess';
  }

  return isConfiguredAdminEmail(email) ? '/admin' : '/';
}

export function getBaseSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export function buildAuthCallbackUrl(next: string) {
  return `${getBaseSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function getAuthErrorMessage(code: string | null | undefined, audience: AuthAudience) {
  switch (code) {
    case 'auth_callback':
    case 'auth_verify':
      return 'No se pudo completar la autenticación. Inténtalo de nuevo.';
    case 'not_editor':
      return audience === 'editor'
        ? 'Tu cuenta existe, pero todavía no tiene permisos editoriales.'
        : 'Tu cuenta no tiene permisos para continuar en esa zona.';
    case 'session_required':
      return 'Necesitas iniciar sesión para continuar.';
    default:
      return null;
  }
}

export function formatSupabaseAuthError(message: string, mode: AuthMode) {
  switch (message) {
    case 'Invalid login credentials':
      return 'Correo o contraseña incorrectos.';
    case 'Email not confirmed':
      return 'Tu cuenta aún no está confirmada. Revisa tu correo y vuelve a intentarlo.';
    case 'User already registered':
      return 'Ya existe una cuenta con ese correo.';
    default:
      return mode === 'signin'
        ? 'No se pudo iniciar sesión ahora mismo.'
        : 'No se pudo crear la cuenta ahora mismo.';
  }
}
