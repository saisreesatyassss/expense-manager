
import { PageHeader } from '@/components/shell/page-header';
import { UserListClient } from './user-list-client';
import { getUsersFromCookie as getUsers } from '@/services/user-service';
import { DEPARTMENTS } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default async function UserListPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {

    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
    const limit = typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10;
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
    const department = typeof searchParams.department === 'string' ? searchParams.department : undefined;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
    
    const usersResponse = await getUsers({ page, limit, q, department, status });

    return (
        <>
            <PageHeader
                title="User Management"
                description="View, manage, and assign roles to users in the system."
            >
                <Button asChild>
                    <Link href="/admin/users/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add User
                    </Link>
                </Button>
            </PageHeader>
            <UserListClient 
                users={usersResponse.data}
                pagination={usersResponse.pagination}
                departments={DEPARTMENTS}
            />
        </>
    );
}
