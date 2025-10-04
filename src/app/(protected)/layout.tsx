
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { AppShell } from '@/components/shell/app-shell';
import { BASE_MOCK_USERS } from '@/lib/data';
import type { User, MockUser } from '@/lib/types';
import { Chatbot } from '@/components/chatbot/chatbot';
import { redirect } from 'next/navigation';

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const [role, username] = token.split(':');
    if (!role || !username) return null;

    const usersCookie = cookieStore.get('users_data');
    let allUsers: MockUser[] = BASE_MOCK_USERS;

    if (usersCookie?.value) {
        try {
            const parsedUsers = JSON.parse(usersCookie.value);
            if(Array.isArray(parsedUsers)) {
                allUsers = parsedUsers;
            }
        } catch (e) {
            console.error("Failed to parse users cookie, falling back to base mocks.", e);
        }
    }
    
    const mockUser = allUsers.find(u => u.username === username && u.role === role);

    if(!mockUser) return null;

    const { password, ...user } = mockUser;
    return user;
  } catch (error) {
    console.error("Failed to get current user from cookie", error);
    return null;
  }
};


export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  // If there's no user, the middleware should have already redirected.
  // But as a failsafe, we can redirect here too.
  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell user={user}>
      {children}
      <Chatbot />
    </AppShell>
  );
}
