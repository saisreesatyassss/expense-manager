
import { PageHeader } from '@/components/shell/page-header';
import { getUsersFromCookie } from '@/services/user-service';
import { RoleAssignmentClient } from './role-assignment-client';

export default async function RoleAssignmentPage() {
  const usersResponse = await getUsersFromCookie({});
  const users = usersResponse.data;

  return (
    <>
      <PageHeader
        title="Role Assignment"
        description="Assign admin or user roles to system users"
      />
      <RoleAssignmentClient initialUsers={users} />
    </>
  );
}
