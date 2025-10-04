
'use server';

import { cookies } from 'next/headers';
import { BASE_MOCK_USERS } from '@/lib/data';
import type { User, MockUser } from '@/lib/types';

type LoginResult = 
  | { success: true; user: Pick<User, 'id' | 'username' | 'role' | 'firstName' | 'lastName'> }
  | { success: false; message: string; user: null };

async function getAllUsers(): Promise<MockUser[]> {
    const cookieStore = cookies();
    const usersCookie = cookieStore.get('users_data');

    if (usersCookie?.value) {
        try {
            return JSON.parse(usersCookie.value);
        } catch (error) {
            return BASE_MOCK_USERS;
        }
    }
    return BASE_MOCK_USERS;
}

export async function login(username: string, password: string): Promise<LoginResult> {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required', user: null };
    }
    
    const allUsers = await getAllUsers();

    const user = allUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid credentials', user: null };
    }

    // Mock token: 'role:username'
    const token = `${user.role}:${user.username}`;

    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return {
        success: true,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    };
}


export async function logout(): Promise<{ success: boolean }> {
  cookies().set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0), // Expire the cookie immediately
  });

  return { success: true };
}
