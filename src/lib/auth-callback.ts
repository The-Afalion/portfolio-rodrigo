import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ensureProfileForUserSafely } from '@/lib/profile';

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
    return '/reset-password';
  }

  const safeNext = getSafeNextPath(next);
  return safeNext === '/' ? '/chess' : safeNext;
}

function getAuthErrorRedirectPath(nextPath: string) {
  if (nextPath.startsWith('/admin') || nextPath.startsWith('/blog')) {
    return '/blog/login';
  }

  return '/login';
}

export async function handleAuthCallback(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const nextPath = getSuccessRedirectPath(type, requestUrl.searchParams.get('next'));
  const authErrorRedirectPath = getAuthErrorRedirectPath(nextPath);

  let response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
