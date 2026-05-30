import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('access_token')?.value;

    // 1. Định nghĩa các tuyến đường cần bảo vệ
    const isAuthRoute = pathname.startsWith('/auth');
    const isEmployerRoute = pathname.startsWith('/employer');
    const isCandidateRoute = pathname.startsWith('/candidate');
    const isAdminRoute = pathname.startsWith('/admin');

    // 2. Cho phép truy cập vào các API hoặc static files
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // 3. Nếu đang ở các trang Dashboard mà không có Token -> Về trang Login
    if ((isEmployerRoute || isCandidateRoute || isAdminRoute) && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 4. Nếu đã có Token, kiểm tra tính hợp lệ và phân quyền
    if (token) {
        try {
            const { payload }: any = await jwtVerify(token, SECRET_KEY);
            const role = payload.role;

            // Nếu đang ở trang Login mà đã đăng nhập -> Về đúng Dashboard theo Role
            if (isAuthRoute) {
                if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                if (role === 'EMPLOYER') return NextResponse.redirect(new URL('/employer/dashboard', request.url));
                return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
            }

            // Kiểm tra chéo quyền truy cập (Vd: Candidate không được vào /employer)
            if (isEmployerRoute && role !== 'EMPLOYER' && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
            }
            if (isAdminRoute && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }

        } catch (error) {
            // Token giả hoặc hết hạn -> Về Login
            if (isEmployerRoute || isCandidateRoute || isAdminRoute) {
                const response = NextResponse.redirect(new URL('/auth/login', request.url));
                response.cookies.delete('access_token');
                return response;
            }
        }
    }

    return NextResponse.next();
}

// Chỉ chạy middleware cho các route cụ thể để tối ưu hiệu năng
export const config = {
    matcher: [
        '/employer/:path*',
        '/candidate/:path*',
        '/admin/:path*',
        '/auth/:path*',
    ],
};
