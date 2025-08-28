import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, extractTokenFromHeader } from '@/lib/auth';
import { auditQueries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = extractTokenFromHeader(authHeader) || cookieToken;

    if (token) {
      // Log logout if user is authenticated
      try {
        const user = await getUserFromToken(token);
        if (user) {
          await auditQueries.log({
            user_id: user.id,
            action: 'LOGOUT',
            table_name: 'users',
            record_id: user.id,
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown'
          });
        }
      } catch (auditError) {
        console.error('Audit log error:', auditError);
        // Don't fail the logout if audit logging fails
      }
    }

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
