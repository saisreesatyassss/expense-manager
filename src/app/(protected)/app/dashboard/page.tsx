
import { cookies } from 'next/headers';
import { PageHeader } from '@/components/shell/page-header';
import { DashboardClient } from './dashboard-client';
import type { Task, Workflow, MockUser } from '@/lib/types';
import { BASE_MOCK_USERS } from '@/lib/data';

const getDashboardData = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
        return { myTasks: [], initiatedTasks: [], workflows: {} };
    }

    const [_, username] = token.split(':');
    
    // --- Load User-Specific "My Tasks" ---
    const myTasksCookieName = `myTasks_${username}`;
    const myTasksCookie = cookieStore.get(myTasksCookieName);
    const myTasks: Task[] = myTasksCookie?.value ? JSON.parse(myTasksCookie.value) : [];

    // --- Load "Initiated Tasks" ---
    const initiatedTasksCookie = cookieStore.get('initiatedWorkflows');
    const allInitiatedTasks: Task[] = initiatedTasksCookie?.value ? JSON.parse(initiatedTasksCookie.value) : [];
    
    // In a real app, you'd filter by initiator ID on the backend.
    // We will pass all and let the client filter for simplicity and to avoid server errors.
    const userCookie = cookieStore.get('users_data');
    let allUsers: MockUser[] = BASE_MOCK_USERS;
    if (userCookie?.value) {
        try {
            const parsedUsers = JSON.parse(userCookie.value);
            if (Array.isArray(parsedUsers)) {
                allUsers = parsedUsers;
            }
        } catch (e) {
            console.error("Failed to parse users_data cookie, falling back.", e);
        }
    }
    const currentUser = allUsers.find(u => u.username === username);

    const initiatedTasks = currentUser 
      ? allInitiatedTasks.filter(t => t.initiator.firstName === currentUser.firstName && t.initiator.lastName === currentUser.lastName)
      : [];


    // --- Load all workflows to get details ---
    const workflowsCookie = cookieStore.get('workflows');
    const workflows: Record<string, Workflow> = workflowsCookie?.value ? JSON.parse(workflowsCookie.value) : {};

    return { myTasks, initiatedTasks, workflows };
};


export default async function DashboardPage() {
    const { myTasks, initiatedTasks, workflows } = await getDashboardData();
  
    return (
        <>
            <PageHeader
                title="My Dashboard"
                description="Welcome back! Here's a summary of your expense reports and approvals."
            />
            <DashboardClient 
                initialMyTasks={myTasks}
                initialInitiatedTasks={initiatedTasks}
                workflows={workflows}
            />
        </>
    );
}
