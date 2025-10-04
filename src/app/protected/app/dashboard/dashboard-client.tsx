
'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { Task, User } from '@/lib/types';
import MyTasksPage from '@/app/protected/app/tasks/my-tasks/page';
import InitiatedTasksPage from '@/app/protected/app/tasks/initiated-tasks/page';
import FinishedTasksPage from '@/app/protected/app/tasks/finished-tasks/page';
import PooledTasksPage from '@/app/protected/app/tasks/pooled-tasks/page';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState }from 'react';
import Cookies from 'js-cookie';

export function DashboardClient() {
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || "my-tasks");
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [initiatedTasks, setInitiatedTasks] = useState<Task[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        // This effect runs on mount to load all data from cookies for the current user.
        const authToken = Cookies.get('auth_token');
        if (!authToken) return;

        try {
            const [role, username] = authToken.split(':');
            const user: User = { role, username, firstName: '', lastName: '', id: '', email: '', employeeId: '', mobile: '', designation: '', department: '', status: 'active' };
            setCurrentUser(user);

            // --- Load User-Specific "My Tasks" ---
            const myTasksCookieName = `myTasks_${username}`;
            const myTasksCookie = Cookies.get(myTasksCookieName);
            setMyTasks(myTasksCookie ? JSON.parse(myTasksCookie) : []);

            // --- Load "Initiated Tasks" (globally for demo, but could be user-specific) ---
            const initiatedTasksCookie = Cookies.get('initiatedWorkflows');
            const allInitiatedTasks = initiatedTasksCookie ? JSON.parse(initiatedTasksCookie) : [];
            // Assuming the initiator is stored properly when creating the workflow
            setInitiatedTasks(allInitiatedTasks);

        } catch (e) {
            console.error("Failed to parse auth token or cookies", e);
        }
        
    }, []);

    useEffect(() => {
      if (tabFromUrl && tabFromUrl !== activeTab) {
          setActiveTab(tabFromUrl);
      }
    }, [tabFromUrl, activeTab]);

    const onTabChange = (value: string) => {
      setActiveTab(value);
      window.history.pushState(null, '', `/protected/app/dashboard?tab=${value}`);
    }

  return (
      <Tabs value={activeTab} onValueChange={onTabChange} defaultValue="my-tasks">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="pooled-tasks">Pooled Tasks</TabsTrigger>
          <TabsTrigger value="finished-tasks">Finished Tasks</TabsTrigger>
          <TabsTrigger value="initiated-tasks">Initiated Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="my-tasks">
            <MyTasksPage tasks={myTasks} />
        </TabsContent>
        <TabsContent value="pooled-tasks">
            <PooledTasksPage />
        </TabsContent>
        <TabsContent value="finished-tasks">
             <FinishedTasksPage />
        </TabsContent>
        <TabsContent value="initiated-tasks">
             <InitiatedTasksPage tasks={initiatedTasks} />
        </TabsContent>
      </Tabs>
  );
}
