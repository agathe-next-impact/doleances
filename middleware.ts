import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Laisse passer uniquement /wp-admin et /wp-login.php, redirige tout le reste vers la racine du front
export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // 1. Toujours laisser passer localhost (dev local)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return NextResponse.next();
  }

  // 2. Si on est sur admin.lesdoleances.fr
  if (hostname === 'admin.lesdoleances.fr') {
    // a. Admin WordPress : laisser passer
    if (pathname.startsWith('/wp-admin') || pathname.startsWith('/wp-login.php')) {
      return NextResponse.next();
    }
    // b. Toute autre route : rediriger vers le front Next.js
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = 'lesdoleances.fr';
    url.pathname = pathname;
    return NextResponse.redirect(url);
  }

  // 3. Si on est déjà sur le front Next.js (lesdoleances.fr), servir normalement
  if (hostname === 'lesdoleances.fr') {
    return NextResponse.next();
  }

  // 4. Sinon, comportement par défaut (laisser passer)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};
