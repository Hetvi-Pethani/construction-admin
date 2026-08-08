import { loginUser } from '@/modules/auth/authService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required.' },
                { status: 400 }
            );
        }

        const result = await loginUser(email, password);

        return NextResponse.json(
            {
                message: 'Login successful',
                session: result.session,
                user: result.user
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Login API Error:', error);

        const status = error.status || 500;

        return NextResponse.json(
            { error: error.message || 'An error occurred during login' },
            { status: status }
        );
    }
}
