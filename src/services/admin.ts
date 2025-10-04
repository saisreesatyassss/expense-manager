
'use server';

import { getUsersFromCookie } from '@/services/user-service';
import type { User, PaginatedResponse } from '@/lib/types';

interface GetUsersParams {
    page?: number;
    limit?: number;
    q?: string;
    department?: string;
    designation?: string;
    status?: string;
}

export async function getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    return getUsersFromCookie(params);
}
