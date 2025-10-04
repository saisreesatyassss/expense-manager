
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      const [role] = token.split(':');
      if (role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/app/dashboard');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}
