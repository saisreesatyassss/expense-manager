
'use server';

import { cookies } from 'next/headers';
import { BASE_MOCK_USERS } from '@/lib/data';
import type { User, PaginatedResponse, MockUser } from '@/lib/types';
import { z } from 'zod';
import { userFormSchema } from '@/lib/schemas';

interface GetUsersParams {
    page?: number;
    limit?: number;
    q?: string;
    department?: string;
    designation?: string;
    status?: string;
}

// This is now the single, authoritative function for getting all users from cookies.
async function getAllUsers(): Promise<MockUser[]> {
    const cookieStore = cookies();
    const usersCookie = cookieStore.get('users_data');

    if (usersCookie?.value) {
        try {
            const parsedUsers = JSON.parse(usersCookie.value);
            // Ensure we return an array, even if cookie is malformed
            return Array.isArray(parsedUsers) ? parsedUsers : BASE_MOCK_USERS;
        } catch (error) {
            console.error('Failed to parse users cookie, falling back to base users:', error);
            // If parsing fails, fall back to the default list.
            return BASE_MOCK_USERS;
        }
    }
    // If cookie doesn't exist at all, this is likely the first run.
    return BASE_MOCK_USERS;
}


export async function getUsersFromCookie(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    const { 
        page = 1, 
        limit = 10, 
        q = '', 
        department, 
        designation, 
        status 
    } = params;

    const allUsers = await getAllUsers();
    
    // The admin user should not be displayed in user management lists
    const displayUsers = allUsers.filter(u => u.username !== 'admin');

    const lowerCaseQuery = q.toLowerCase();

    // Simulate database filtering
    let filteredUsers: User[] = displayUsers.map(u => {
        const { password, ...user } = u; // Ensure password is not in the final user object
        return user;
    }).filter(user => {
        const searchMatch =
            lowerCaseQuery === '' ||
            user.firstName.toLowerCase().includes(lowerCaseQuery) ||
            user.lastName.toLowerCase().includes(lowerCaseQuery) ||
            user.username.toLowerCase().includes(lowerCaseQuery) ||
            user.email.toLowerCase().includes(lowerCaseQuery);
        
        const departmentMatch = !department || department === 'all' || user.department === department;
        const designationMatch = !designation || designation === 'all' || user.designation === designation;
        const statusMatch = !status || status === 'all' || user.status === status;

        return searchMatch && departmentMatch && designationMatch && statusMatch;
    });

    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Simulate network delay for a better UX feel
    await new Promise(resolve => setTimeout(resolve, 300)); 

    return {
        data: paginatedUsers,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            limit,
        },
    };
}


// This is a write function, only to be used in Server Actions.
export async function saveUser(userData: z.infer<typeof userFormSchema>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const cookieStore = cookies();
        let allUsers: MockUser[] = await getAllUsers();

        // Check for duplicates
        if (allUsers.some(u => u.username === userData.username)) {
            return { success: false, error: 'Username already exists.' };
        }
        if (allUsers.some(u => u.email === userData.email)) {
            return { success: false, error: 'Email already exists.' };
        }

        // Separate password from the rest of the user data
        const { password, confirmPassword, ...userProps } = userData;

        // Create the new user object
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...userProps,
            status: 'active',
            avatarUrl: `https://picsum.photos/seed/avatar${Date.now()}/100/100`,
        };
        
        const newUserWithPassword: MockUser = { ...newUser, password: password };
        
        const updatedUsers = [...allUsers, newUserWithPassword];
        
        // Write the updated list back to the cookie.
        cookieStore.set('users_data', JSON.stringify(updatedUsers), { path: '/', maxAge: 60 * 60 * 24 * 7 });
        
        const { password: _, ...userToReturn } = newUserWithPassword;
        return { success: true, user: userToReturn };

    } catch (error) {
        console.error("Error in saveUser:", error);
        return { success: false, error: "An unexpected error occurred while saving the user." };
    }
}
