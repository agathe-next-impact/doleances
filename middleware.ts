import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Laisse passer uniquement /wp-admin et /wp-login.php, redirige tout le reste vers la racine du front
export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // 1. Toujours laisser passer localhost (dev local)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return NextResponse.next();
  }

  // 2. Si on est sur wpasso.fr
  if (hostname === 'wpasso.fr') {
    // a. Admin WordPress : laisser passer
    if (pathname.startsWith('/wp-admin') || pathname.startsWith('/wp-login.php')) {
      return NextResponse.next();
    }
    // b. Toute autre route : rediriger vers le front Next.js (ex: wp-asso.fr)
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = 'wp-asso.fr'; // Remplacez par l'URL du front Next.js si besoin
    url.pathname = pathname;
    return NextResponse.redirect(url);
  }

  // 3. Si on est déjà sur le front Next.js (wp-asso.fr), servir normalement
  if (hostname === 'wp-asso.fr') {
    return NextResponse.next();
  }

  // 4. Sinon, comportement par défaut (laisser passer)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};
