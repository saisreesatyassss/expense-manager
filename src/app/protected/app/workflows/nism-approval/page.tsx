
import { cookies } from 'next/headers';
import { PageHeader } from '@/components/shell/page-header';
import { NismApprovalForm } from '@/components/workflows/nism-approval-form';
import { DEPARTMENTS, BASE_MOCK_USERS } from '@/lib/data';
import type { User, MockUser } from '@/lib/types';

async function getAllUsers(): Promise<MockUser[]> {
    const cookieStore = cookies();
    const usersCookie = cookieStore.get('users_data');

    if (usersCookie?.value) {
        try {
            const parsed = JSON.parse(usersCookie.value);
            // Ensure we return an array, even if the cookie is malformed
            return Array.isArray(parsed) ? parsed : BASE_MOCK_USERS;
        } catch {
            return BASE_MOCK_USERS;
        }
    }
    return BASE_MOCK_USERS;
}

const getCurrentUser = async (allUsers: MockUser[]): Promise<User | null> => {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  const [role, username] = token.split(':');

  const mockUser = allUsers.find(u => u.username === username);

  if(!mockUser) return null;

  // We are omitting the password field for security.
  const { password, ...user } = mockUser;
  return user;
};


export default async function NismApprovalPage() {
  const allUsers = await getAllUsers();
  const currentUser = await getCurrentUser(allUsers);

  // Safely find users for predefined roles. If a user for a role doesn't exist, it will be undefined.
  const predefinedApproversSetup = [
    {
        user: allUsers.find(u => u.designation === 'Deputy General Manager'),
        role: 'Deputy General Manager',
        department: 'Academic Affairs'
    },
    {
        user: allUsers.find(u => u.designation === 'General Manager'),
        role: 'General Manager',
        department: 'Administration'
    },
    {
        user: allUsers.find(u => u.designation === 'Deputy Director'),
        role: 'Deputy Director',
        department: 'Finance & Accounts'
    },
    {
        user: allUsers.find(u => u.username === 'admin'),
        role: 'Director',
        department: 'Administration'
    },
  ];

  // Filter out any entries where the user was not found, ensuring we only pass valid users to the component.
  const predefinedApprovers = predefinedApproversSetup.filter(
      (item): item is { user: User; role: string; department: string } => !!item.user
  );


  const departments = DEPARTMENTS;
  const fileNumber = `NISM/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="NISM Approval Note"
        description="Create and submit a new NISM Approval Note."
      />
      <NismApprovalForm 
        departments={departments}
        fileNumber={fileNumber}
        predefinedApprovers={predefinedApprovers}
        initiator={currentUser}
      />
    </div>
  );
}
