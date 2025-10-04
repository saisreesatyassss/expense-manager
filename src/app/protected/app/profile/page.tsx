
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shell/page-header';
import { KeyRound, Mail, Pencil, Phone, User as UserIcon, Building, Briefcase } from 'lucide-react';
import type { User, MockUser } from '@/lib/types';
import { BASE_MOCK_USERS } from '@/lib/data';
import Link from 'next/link';

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const [role, username] = token.split(':');

  const usersCookie = cookieStore.get('users_data');
  let allUsers: MockUser[] = BASE_MOCK_USERS;
  if (usersCookie) {
    try {
      allUsers = JSON.parse(usersCookie.value);
    } catch {
      // Fallback to mock users if cookie is malformed
    }
  }

  const mockUser = allUsers.find(u => u.username === username && u.role === role);

  if(!mockUser) return null;

  return mockUser;
};


export default async function UserProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <PageHeader
        title="User Profile"
        description="View and manage your profile information."
      />
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback className="text-3xl">
                            {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                    <p className="text-muted-foreground">{user.designation}</p>
                    <p className="text-sm text-muted-foreground mb-4">{user.department}</p>
                    <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                    
                    <div className="mt-6 w-full space-y-2">
                        <Button className="w-full">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/protected/app/profile/change-password">
                                <KeyRound className="mr-2 h-4 w-4" /> Change Password
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        <InfoItem icon={UserIcon} label="First Name" value={user.firstName} />
                        <InfoItem icon={UserIcon} label="Last Name" value={user.lastName} />
                        <InfoItem icon={UserIcon} label="Username" value={user.username} />
                        <InfoItem icon={Mail} label="Email" value={user.email} />
                        <InfoItem icon={Phone} label="Mobile Number" value={user.mobile} />
                        <InfoItem icon={UserIcon} label="Employee ID" value={user.employeeId} />
                        <InfoItem icon={Briefcase} label="Designation" value={user.designation} />
                        <InfoItem icon={Building} label="Department" value={user.department} />
                    </dl>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}


function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
    return (
        <div className="flex items-start">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
            <div>
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className="text-sm text-foreground">{value}</dd>
            </div>
        </div>
    );
}
