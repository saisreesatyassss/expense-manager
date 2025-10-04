
import { cookies } from 'next/headers';
import { PageHeader } from '@/components/shell/page-header';
import { NewWorkflowForm } from '@/components/workflows/new-workflow-form';
import { DEPARTMENTS, BASE_MOCK_USERS } from '@/lib/data';
import type { User, MockUser } from '@/lib/types';

async function getUsers(): Promise<MockUser[]> {
    const cookieStore = cookies();
    const usersCookie = cookieStore.get('users_data');

    if (usersCookie?.value) {
        try {
            const parsed = JSON.parse(usersCookie.value);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return BASE_MOCK_USERS;
        }
    }
    return BASE_MOCK_USERS;
}


const getCurrentUser = async (allUsers: MockUser[]): Promise<User | null> => {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const [role, username] = token.split(':');
    const mockUser = allUsers.find(u => u.username === username && u.role === role);

    if (!mockUser) return null;

    const { password, ...user } = mockUser;
    return user;
  } catch (error) {
    return null;
  }
};


export default async function NewWorkflowPage() {
  const allUsers = await getUsers();
  const currentUser = await getCurrentUser(allUsers);

  // In a real app, available users and departments would be fetched from an API
  const availableApprovers = allUsers.map(u => {
    const { password, ...user } = u;
    return user;
  });
  const departments = DEPARTMENTS;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Initiate New Workflow"
        description="Fill out the details below to start a new approval process."
      />
      <NewWorkflowForm 
        availableApprovers={availableApprovers}
        departments={departments}
        initiator={currentUser}
      />
    </div>
  );
}
