
'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Task, Workflow, User } from '@/lib/types';
import MyTasksPage from '@/app/(protected)/app/tasks/my-tasks/page';
import InitiatedTasksPage from '@/app/(protected)/app/tasks/initiated-tasks/page';
import FinishedTasksPage from '@/app/(protected)/app/tasks/finished-tasks/page';
import PooledTasksPage from '@/app/(protected)/app/tasks/pooled-tasks/page';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Cookies from 'js-cookie';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FileClock, CheckCircle, Send, Activity, Users, FileCheck2, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DashboardClientProps {
    initialMyTasks: Task[];
    initialInitiatedTasks: Task[];
    workflows: Record<string, Workflow>;
}

export function DashboardClient({ initialMyTasks, initialInitiatedTasks, workflows }: DashboardClientProps) {
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    
    const [activeTab, setActiveTab] = useState(tabFromUrl || "my-tasks");
    const [myTasks, setMyTasks] = useState<Task[]>(initialMyTasks);
    const [initiatedTasks, setInitiatedTasks] = useState<Task[]>(initialInitiatedTasks);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const authToken = Cookies.get('auth_token');
        if (!authToken) return;

        try {
            const [role, username] = authToken.split(':');
            const user: User = { role, username, firstName: '', lastName: '', id: '', email: '', employeeId: '', mobile: '', designation: '', department: '', status: 'active' };
            setCurrentUser(user);
        } catch (e) {
            console.error("Failed to parse auth token", e);
        }
    }, []);

    useEffect(() => {
        setMyTasks(initialMyTasks);
        setInitiatedTasks(initialInitiatedTasks);
    }, [initialMyTasks, initialInitiatedTasks]);

    useEffect(() => {
      if (tabFromUrl && tabFromUrl !== activeTab) {
          setActiveTab(tabFromUrl);
      }
    }, [tabFromUrl, activeTab]);

    const onTabChange = (value: string) => {
      setActiveTab(value);
      window.history.pushState(null, '', `/app/dashboard?tab=${value}`);
    }

    const pendingTasksCount = myTasks.filter(t => t.status === 'pending').length;
    const inProgressWorkflows = initiatedTasks.filter(t => t.status === 'in-progress').length;
    
    const recentFinishedCount = useMemo(() => {
        return Object.values(workflows).filter(w => 
            w.status === 'approved' || w.status === 'rejected'
        ).length;
    }, [workflows]);
    
    const summaryData = [
        { title: 'Pending Tasks', count: pendingTasksCount, icon: FileClock, change: 'Awaiting your action', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
        { title: 'In-Progress', count: inProgressWorkflows, icon: Send, change: 'Workflows you have initiated', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { title: 'Finished', count: recentFinishedCount, icon: CheckCircle, change: 'Recently completed or rejected', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    ];

    const recentActivity = useMemo(() => {
        const myTaskActivities = myTasks.map(t => ({
            id: t.id,
            workflowId: t.workflowId,
            title: t.title,
            type: 'New Task Assigned',
            date: parseISO(workflows[t.workflowId]?.createdAt || new Date().toISOString()),
            status: t.status,
            icon: FileClock
        }));
        const initiatedActivities = initiatedTasks.map(t => ({
            id: t.id,
            workflowId: t.workflowId,
            title: t.title,
            type: 'Workflow Initiated',
            date: parseISO(t.createdAt || new Date().toISOString()),
            status: t.status,
            icon: Send
        }));

        return [...myTaskActivities, ...initiatedActivities]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);

    }, [myTasks, initiatedTasks, workflows]);

    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaryData.map((item, index) => (
                <Card 
                    key={item.title} 
                    className={cn(
                        "border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up",
                        item.color.replace('text-', 'border-')
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                        <item.icon className={cn("h-5 w-5 text-muted-foreground", item.color)} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{item.count}</div>
                        <p className="text-xs text-muted-foreground">{item.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
            {/* Main content - Tabs */}
            <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Tabs value={activeTab} onValueChange={onTabChange} defaultValue="my-tasks">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 border">
                        <TabsTrigger value="my-tasks"><ListTodo className="mr-2"/>My Tasks</TabsTrigger>
                        <TabsTrigger value="pooled-tasks"><Users className="mr-2"/>Pooled</TabsTrigger>
                        <TabsTrigger value="finished-tasks"><FileCheck2 className="mr-2"/>Finished</TabsTrigger>
                        <TabsTrigger value="initiated-tasks"><Send className="mr-2"/>Initiated</TabsTrigger>
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
            </div>
            
            {/* Recent Activity */}
            <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity /> Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length > 0 ? (
                            <ul className="space-y-1">
                                {recentActivity.map((activity, index) => {
                                    const isNewTask = activity.type === 'New Task Assigned';
                                    return (
                                    <li 
                                        key={activity.id} 
                                        className="animate-fade-in-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <Link href={`/app/tasks/${activity.workflowId}`} className="block p-3 rounded-lg hover:bg-muted transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className={cn("flex-shrink-0 mt-1 h-8 w-8 rounded-full flex items-center justify-center", isNewTask ? 'bg-yellow-500/10' : 'bg-blue-500/10')}>
                                                    <activity.icon className={cn("h-4 w-4", isNewTask ? 'text-yellow-500' : 'text-blue-500')} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm leading-tight">{activity.title}</p>
                                                    <div className="flex justify-between items-center">
                                                         <p className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(activity.date, { addSuffix: true })}
                                                        </p>
                                                        <Badge variant={isNewTask ? 'destructive' : 'secondary'} className="text-xs">{activity.type}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                )})}
                            </ul>
                        ) : (
                            <div className="text-center h-48 flex flex-col justify-center items-center">
                                <Activity className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground">No recent activity to show.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    );
}
