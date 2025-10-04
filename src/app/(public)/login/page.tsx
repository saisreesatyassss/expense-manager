
import { cookies } from 'next/headers';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, User, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import { BASE_MOCK_USERS } from '@/lib/data';
import type { MockUser } from '@/lib/types';

async function getDisplayUsers(): Promise<MockUser[]> {
    const cookieStore = cookies();
    const usersCookie = cookieStore.get('users_data');
    
    if (usersCookie?.value) {
        try {
            const parsedUsers = JSON.parse(usersCookie.value);
            if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
                return parsedUsers;
            }
        } catch (e) {
            console.error("Failed to parse users cookie on login page, falling back to base mocks.", e);
        }
    }
    
    // Fallback if the cookie is missing or malformed.
    return BASE_MOCK_USERS;
}


export default async function LoginPage() {
    const users = await getDisplayUsers();
    
    const adminUser = users.find(user => user.role === 'admin');
    const regularUsers = users.filter(user => user.role !== 'admin');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-primary rounded-full p-3 mb-4">
                <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary">FlowForm</h1>
            <p className="text-muted-foreground">Approval Management System</p>
        </div>

        <LoginForm />

        <Card>
            <CardHeader>
                <CardTitle>🎯 Login Credentials</CardTitle>
                <CardDescription>Use these accounts for testing different roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                 {adminUser && (
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <p className="font-bold flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-primary" />{adminUser.designation}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-muted-foreground">
                           <div className="flex items-center gap-2">
                               <User className="h-4 w-4" />
                               <span>{adminUser.username}</span>
                           </div>
                           <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4" />
                                <span>{adminUser.password || 'password'}</span>
                           </div>
                       </div>
                    </div>
                 )}
                {regularUsers.map((user) => (
                    <div key={user.username} className="flex flex-col sm:flex-row justify-between sm:items-center">
                       <p className="font-bold flex items-center"><UserCheck className="mr-2 h-4 w-4 text-primary" />{user.designation}</p>
                       <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-muted-foreground">
                           <div className="flex items-center gap-2">
                               <User className="h-4 w-4" />
                               <span>{user.username}</span>
                           </div>
                           <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4" />
                                <span>{user.password || 'password'}</span>
                           </div>
                       </div>
                    </div>
                ))}
                 <div className="pt-2 text-xs text-center text-muted-foreground">
                    Newly created users will appear here.
                </div>
            </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
            Contact your administrator if you have issues logging in.
            <br />
            LDAP UI Hints: {process.env.LDAP_UI_HINTS || 'Use your network credentials.'}
        </p>
      </div>
    </div>
  );
}
