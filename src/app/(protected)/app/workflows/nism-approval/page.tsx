
import { cookies } from 'next/headers';
import { PageHeader } from '@/components/shell/page-header';
import { NismApprovalForm } from '@/components/workflows/nism-approval-form';
import { DEPARTMENTS, BASE_MOCK_USERS } from '@/lib/data';
import type { User, MockUser } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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

  // Safely find users for predefined roles.
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
        user: allUsers.find(u => u.username === 'admin'), // Director is the admin user
        role: 'Director',
        department: 'Administration'
    },
  ];

  // Filter and map the approvers, ensuring no undefined users are processed
  const predefinedApprovers = predefinedApproversSetup.reduce((acc, item) => {
    if (item.user) {
      const { password, ...userWithoutPassword } = item.user;
      acc.push({
        ...item,
        user: userWithoutPassword,
      });
    }
    return acc;
  }, [] as { user: User; role: string; department: string }[]);

  const missingRoles = predefinedApproversSetup
    .filter(item => !item.user)
    .map(item => item.role);

  const departments = DEPARTMENTS;
  const fileNumber = `NISM/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="NISM Approval Note"
        description="Create and submit a new NISM Approval Note."
      />
      {missingRoles.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Required Users!</AlertTitle>
          <AlertDescription>
            This workflow cannot be initiated because the following required user roles are not configured: <strong>{missingRoles.join(', ')}</strong>. 
            Please <Link href="/admin/users/new" className="font-bold underline">add users</Link> with these designations in the Admin Panel to proceed.
          </AlertDescription>
        </Alert>
      )}
      <NismApprovalForm 
        departments={departments}
        fileNumber={fileNumber}
        predefinedApprovers={predefinedApprovers}
        initiator={currentUser}
        isSubmittable={missingRoles.length === 0}
      />
    </div>
  );
}
