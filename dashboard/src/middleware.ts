import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;

  console.log("Token:", token ? "Existe" : "Não existe", " Path:", pathname);

  // Redireciona usuário logado que tenta ir para /signing
  if (pathname.startsWith("/signing") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redireciona usuário não logado que tenta ir para /dashboard
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/signing", req.url));
  }

  // // Redireciona usuário não logado que tenta ir para /dashboard
  // if (pathname.startsWith("/register") && !token) {
  //   return NextResponse.redirect(new URL("/signing", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",       // raiz
    "/dashboard/:path*", // subrotas
    "/register",
    "/register/:path*",
    "/signing",
  ],
};
