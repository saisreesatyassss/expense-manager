
import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shell/page-header';
import {
  Activity,
  ClipboardCheck,
  FileClock,
  FileCheck,
  Users,
  Workflow,
} from 'lucide-react';
import type { Task, User, MockUser } from '@/lib/types';
import { BASE_MOCK_USERS } from '@/lib/data';

const getAdminDashboardData = async () => {
    const cookieStore = cookies();
    
    const myTasksCookie = cookieStore.get('myTasks');
    const initiatedWorkflowsCookie = cookieStore.get('initiatedWorkflows');
    const usersCookie = cookieStore.get('users_data');
    
    let allUsers: MockUser[] = BASE_MOCK_USERS;
    if (usersCookie?.value) {
        try {
            allUsers = JSON.parse(usersCookie.value);
        } catch {
             allUsers = BASE_MOCK_USERS;
        }
    }

    const myTasks: Task[] = myTasksCookie?.value ? JSON.parse(myTasksCookie.value) : [];
    const initiatedTasks: Task[] = initiatedWorkflowsCookie?.value ? JSON.parse(initiatedWorkflowsCookie.value) : [];

    const totalWorkflows = initiatedTasks.length;
    const pendingTasks = myTasks.filter(t => t.status === 'pending').length;
    const approvedTasks = myTasks.filter(t => t.status === 'approved').length;

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.status === 'active').length;

    const allTasks = [...initiatedTasks, ...myTasks].sort((a,b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
        return dateB.getTime() - dateA.getTime();
    }).slice(0, 5); // show latest 5 tasks overall

    const recentTasks = allTasks.map(task => ({
        initiator: `${task.initiator.firstName} ${task.initiator.lastName}`,
        title: task.title,
        department: allUsers.find(u => u.firstName === task.initiator.firstName)?.department || 'N/A',
        currentApprover: task.currentStage || 'N/A',
        status: task.status,
        created: task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A',
    }));

    const summaryData = [
        { title: 'Total Workflows', count: totalWorkflows, icon: Workflow, change: 'All initiated flows' },
        { title: 'Pending Tasks', count: pendingTasks, icon: FileClock, change: 'Awaiting approval' },
        { title: 'Approved Tasks', count: approvedTasks, icon: FileCheck, change: 'Successfully approved' },
        { title: 'Active Users', count: `${activeUsers}/${totalUsers}`, icon: Users, change: `out of ${totalUsers} total` },
      ];

    return { summaryData, recentTasks };
};


export default async function AdminDashboardPage() {
  const { summaryData, recentTasks } = await getAdminDashboardData();

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of system activities and workflow management."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {summaryData.map(item => (
          <SummaryCard key={item.title} {...item} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Initiator</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTasks.length > 0 ? (
                recentTasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{task.initiator}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.department}</TableCell>
                    <TableCell>{task.currentApprover}</TableCell>
                    <TableCell>
                      <Badge variant={
                          task.status === 'completed' || task.status === 'approved' ? 'secondary' : 
                          task.status === 'rejected' ? 'destructive' :
                          'default'
                        }>{task.status}</Badge>
                    </TableCell>
                    <TableCell>{task.created}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No recent tasks found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function SummaryCard({ title, count, icon: Icon, change }: { title: string; count: string | number; icon: React.ElementType, change: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
