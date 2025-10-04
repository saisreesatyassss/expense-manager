
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { Workflow, Task, User } from '@/lib/types';
import { format, addDays } from 'date-fns';

interface PerformActionPayload {
    workflowId: string;
    action: 'approve' | 'reject';
    comment?: string;
    currentUser: User;
}

export async function performTaskAction(payload: PerformActionPayload): Promise<{ success: boolean, error?: string }> {
    const { workflowId, action, comment, currentUser } = payload;
    
    try {
        const workflowsCookie = cookies().get('workflows');
        if (!workflowsCookie) throw new Error('Workflows data not found.');
        
        const workflows: Record<string, Workflow> = JSON.parse(workflowsCookie.value);
        const workflow = workflows[workflowId];
        if (!workflow) throw new Error('Expense report not found.');
        
        // 1. Remove task from current user's "My Tasks"
        const currentUserTasksCookieName = `myTasks_${currentUser.username}`;
        const currentUserTasksCookie = cookies().get(currentUserTasksCookieName);
        let currentUserTasks: Task[] = currentUserTasksCookie ? JSON.parse(currentUserTasksCookie.value) : [];
        currentUserTasks = currentUserTasks.filter(t => t.workflowId !== workflowId);
        cookies().set(currentUserTasksCookieName, JSON.stringify(currentUserTasks), { path: '/' });

        // 2. Update workflow history
        workflow.history.push({
            id: `hist-${Date.now()}`,
            user: { username: currentUser.username, firstName: currentUser.firstName, lastName: currentUser.lastName },
            action,
            comment,
            timestamp: new Date().toISOString(),
        });
        
        const isFinalStep = workflow.currentStep >= workflow.approvers.length - 1;

        if (action === 'approve') {
            if (isFinalStep) {
                // Final approval
                workflow.status = 'approved';
                workflow.currentStep++;
            } else {
                // Move to next step
                workflow.currentStep++;
                const nextApprover = workflow.approvers[workflow.currentStep];

                // 3. Add task to next approver's "My Tasks"
                const nextTask: Task = {
                    id: `task-my-${workflowId}`,
                    workflowId: workflowId,
                    title: workflow.title,
                    initiator: { firstName: workflow.initiator.firstName, lastName: workflow.initiator.lastName },
                    dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                    status: 'pending',
                    taskType: 'My'
                };
                
                const nextUserTasksCookieName = `myTasks_${nextApprover.id}`;
                const nextUserTasksCookie = cookies().get(nextUserTasksCookieName);
                const nextUserTasks: Task[] = nextUserTasksCookie ? JSON.parse(nextUserTasksCookie.value) : [];
                nextUserTasks.push(nextTask);
                cookies().set(nextUserTasksCookieName, JSON.stringify(nextUserTasks), { path: '/' });
            }
        } else if (action === 'reject') {
            workflow.status = 'rejected';
        }
        
        // 4. Update the main workflow object in the cookie
        workflows[workflowId] = workflow;
        cookies().set('workflows', JSON.stringify(workflows), { path: '/' });
        
        // 5. Revalidate path to ensure UI updates
        revalidatePath('/app/dashboard');
        revalidatePath(`/app/tasks/${workflowId}`);
        
        return { success: true };

    } catch (error) {
        console.error("Action failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
    }
}
