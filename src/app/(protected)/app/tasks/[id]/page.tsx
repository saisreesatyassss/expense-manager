import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shell/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { File, Paperclip, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Workflow, AuditEvent, MockUser, User as AppUser } from '@/lib/types';
import { ApprovalActions } from './approval-actions';
import { BASE_MOCK_USERS } from '@/lib/data';

function getWorkflow(id: string): Workflow | undefined {
    const workflowsCookie = cookies().get('workflows');
    if (!workflowsCookie) return undefined;

    const workflows = JSON.parse(workflowsCookie.value);
    return workflows[id];
}

async function getAllUsers(): Promise<MockUser[]> {
    const cookieStore = cookies();
    const usersCookie = cookieStore.get('users_data');

    if (usersCookie?.value) {
        try {
            return JSON.parse(usersCookie.value);
        } catch (error) {
            return BASE_MOCK_USERS;
        }
    }
    return BASE_MOCK_USERS;
}

async function getCurrentUser(): Promise<AppUser | null> {
    const token = cookies().get('auth_token')?.value;
    if (!token) return null;
    const [_, username] = token.split(':');
    const allUsers = await getAllUsers();
    const user = allUsers.find(u => u.username === username) || null;
    if (!user) return null;
    const { password, ...userProps } = user;
    return userProps;
}

export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
    const workflow = getWorkflow(params.id);
    const currentUser = await getCurrentUser();

    if (!workflow || !currentUser) {
        notFound();
    }
    
    const isCurrentUserTurn = workflow.approvers[workflow.currentStep]?.id === currentUser.username;

    return (
        <>
            <PageHeader
                title={workflow.title}
                description={`Workflow ID: ${workflow.id}`}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Note Sheet</CardTitle>
                            <CardDescription>
                                Initiated by {workflow.initiator.firstName} {workflow.initiator.lastName} on {format(new Date(workflow.createdAt), 'PPP')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div 
                                className="prose dark:prose-invert max-w-none" 
                                dangerouslySetInnerHTML={{ __html: workflow.noteSheet }} 
                             />
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Paperclip className="h-5 w-5" /> Attachments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {workflow.attachments && workflow.attachments.length > 0 ? (
                                <ul className="space-y-2">
                                    {workflow.attachments.map(file => (
                                        <li key={file.name} className="flex items-center gap-3 p-2 border rounded-md">
                                            <File className="h-5 w-5 text-muted-foreground"/>
                                            <span className="font-medium text-sm">{file.name}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No attachments for this workflow.</p>
                            )}
                        </CardContent>
                    </Card>
                    
                    {isCurrentUserTurn && workflow.status === 'in-progress' && (
                        <ApprovalActions workflow={workflow} currentUser={currentUser} />
                    )}

                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Chain</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">                  
                                {workflow.approvers.map((approver, index) => {
                                    const stepStatus = workflow.currentStep > index 
                                        ? 'approved' 
                                        : workflow.currentStep === index 
                                            ? 'pending'
                                            : 'upcoming';
                                    
                                    const historyEvent = workflow.history.find(h => h.user.username === approver.id);

                                    return (
                                        <li key={index} className="mb-6 ml-6">
                                            <span className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ${
                                                stepStatus === 'approved' ? 'bg-green-500' :
                                                stepStatus === 'pending' ? 'bg-yellow-400 ring-4 ring-yellow-100 dark:ring-yellow-900' :
                                                'bg-gray-300 dark:bg-gray-600'
                                            }`}></span>
                                            <h3 className="font-semibold">{approver.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {stepStatus === 'approved' && historyEvent ? `Approved on ${format(new Date(historyEvent.timestamp), 'PP')}` : `Status: ${stepStatus}`}
                                            </p>
                                        </li>
                                    )
                                })}
                            </ol>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {workflow.history.map((event: AuditEvent) => (
                                    <li key={event.id} className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary">
                                                <User className="h-4 w-4 text-secondary-foreground" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {event.user.firstName} {event.user.lastName}
                                                <span className="text-muted-foreground font-normal ml-2">{event.action}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(event.timestamp), 'PPpp')}
                                            </p>
                                            {event.comment && <p className="text-sm mt-1 italic">"{event.comment}"</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
