import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '../../components/login-form';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '../../lib/admin-auth';

export const metadata = {
    title: 'Login Admin',
    robots: {
        index: false,
        follow: false
    }
};

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
    const cookieStore = await cookies();
    if (verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
        redirect('/admin');
    }
    return <LoginForm />;
}
