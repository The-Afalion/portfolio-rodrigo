import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ensureProfileForUserSafely } from '@/lib/profile';
import {
  buildForgotPasswordPath,
  buildLoginPath,
  getFirstQueryValue,
  getDefaultAuthPath,
  parseAuthAudience,
} from '@/lib/auth';
import { getSupabaseBrowserEnv } from '@/lib/supabase-env';

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }

  return next;
}

function getSuccessRedirectPath(type: EmailOtpType | null, next: string | null) {
  if (type === 'recovery') {
    return next && next.startsWith('/reset-password') ? next : '/reset-password';
  }

  return getSafeNextPath(next);
}

function getAuthErrorRedirectPath(nextPath: string) {
  if (nextPath.startsWith('/reset-password')) {
    const nextUrl = new URL(nextPath, 'http://localhost');
    const audience = parseAuthAudience(getFirstQueryValue(nextUrl.searchParams.get('audience')));
    const originalNext = getFirstQueryValue(nextUrl.searchParams.get('next'));
    return buildForgotPasswordPath(audience, originalNext);
  }

  if (nextPath.startsWith('/admin') || nextPath.startsWith('/blog')) {
    return buildLoginPath('editor', nextPath);
  }

  if (nextPath.startsWith('/chess')) {
    return buildLoginPath('chess', nextPath);
  }

  const audience = parseAuthAudience(null);
  const originalNext = nextPath === '/' ? getDefaultAuthPath(audience) : nextPath;
  return buildLoginPath(audience, originalNext);
}

export async function handleAuthCallback(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const requestedNext = requestUrl.searchParams.get('next');
  const nextPath = getSuccessRedirectPath(type, requestedNext);
  const authErrorRedirectPath = getAuthErrorRedirectPath(nextPath);
  const env = getSupabaseBrowserEnv();

  let response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));

  if (!env) {
    return NextResponse.redirect(new URL(`${authErrorRedirectPath}?error=auth_callback`, requestUrl.origin));
  }

  const supabase = createServerClient(
    env.url,
    env.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`${authErrorRedirectPath}?error=auth_callback`, requestUrl.origin));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(new URL(`${authErrorRedirectPath}?error=auth_verify`, requestUrl.origin));
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileForUserSafely(user);
  }

  return response;
}
