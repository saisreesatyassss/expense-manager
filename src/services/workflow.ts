

// services/workflow.ts

// TODO: Replace all mock implementations with actual API calls to your backend.
// This file contains placeholder functions for interacting with the workflow API.

import type { Workflow, Task, User } from "@/lib/types";
import { BASE_MOCK_USERS as MOCK_USERS } from "@/lib/data";
import { format, subDays, addDays } from 'date-fns';

// This is a temporary in-memory store for demo purposes.
// In a real app, this would not exist on the frontend.
export let initiatedWorkflows: Task[] = [
    {
        id: 'iwf-1',
        workflowId: 'WF-98765',
        title: 'Annual Performance Review',
        initiator: { firstName: 'Self', lastName: '' },
        type: 'Green Note',
        status: 'in-progress',
        progress: 50,
        currentStage: 'HR Approval',
        priority: 'Medium',
        createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        dueDate: 'N/A',
        taskType: 'Initiated'
    },
    {
        id: 'iwf-2',
        workflowId: 'WF-98764',
        title: 'New Server Purchase',
        initiator: { firstName: 'Self', lastName: '' },
        type: 'NISM Approval',
        status: 'completed',
        progress: 100,
        currentStage: 'Finished',
        priority: 'High',
        createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        dueDate: 'N/A',
        taskType: 'Initiated'
    },
];

export let myTasks: Task[] = [
    { id: '1', workflowId: 'WF-123', title: 'Q1 Budget Approval', initiator: { firstName: 'Alice', lastName: 'L.' }, dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'), status: 'pending', taskType: 'My' },
    { id: '2', workflowId: 'WF-124', title: 'New Marketing Campaign', initiator: { firstName: 'Bob', lastName: 'M.' }, dueDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'), status: 'pending', taskType: 'My' },
];


/**
 * Creates a new workflow instance.
 * @param payload The workflow creation payload from the form.
 * @param initiator The user who is creating the workflow.
 * @returns A promise that resolves with the new workflow's ID.
 */
export async function createWorkflow(payload: any, initiator: User): Promise<{ workflowId: string }> {
  console.log("MOCK API: POST /api/workflows/start with payload:", payload);
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  const workflowId = `WF-${Date.now()}`;
  const taskId = `TSK-${Date.now()}`;

  // Add to our mock in-memory store for initiated tasks
  initiatedWorkflows.push({
    id: workflowId,
    workflowId: workflowId,
    title: payload.title,
    initiator: { firstName: initiator.firstName, lastName: initiator.lastName},
    type: 'Expense Report',
    status: 'in-progress',
    progress: 10,
    currentStage: payload.approvers[0]?.name || 'Initial Review',
    priority: 'Medium',
    createdAt: format(new Date(), 'yyyy-MM-dd'),
    dueDate: 'N/A',
    taskType: 'Initiated'
  });

  // Also add a new task to "My Tasks" for the first approver IF they are the initiator.
  if(payload.approvers && payload.approvers.length > 0) {
    const firstApproverUsername = payload.approvers[0].id;
    // For demo purposes, we add to myTasks if the initiator is also the first approver.
    // In a real app, the backend would assign this task to the first approver.
    if (initiator.username === firstApproverUsername) {
        myTasks.unshift({
            id: taskId,
            workflowId: workflowId,
            title: payload.title,
            initiator: { firstName: initiator.firstName, lastName: initiator.lastName },
            dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            status: 'pending',
            taskType: 'My'
        });
    }
  }


  return { workflowId };
}

/**
 * Creates a new NISM Approval Note workflow.
 * @param payload The form data.
 * @param initiator The user creating the note.
 * @param fileNumber The generated file number.
 * @returns A promise that resolves when the creation is complete.
 */
export async function createNismApproval(payload: any, initiator: User, fileNumber: string): Promise<{ success: boolean }> {
    console.log("MOCK SERVICE: Creating NISM Approval Note with payload:", { ...payload, fileNumber, initiator });
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const workflowId = fileNumber.replace(/\//g, '-');
  
    // Add to our mock in-memory store for initiated tasks
    initiatedWorkflows.push({
      id: workflowId,
      workflowId: workflowId,
      title: payload.subject,
      initiator: { firstName: initiator.firstName, lastName: initiator.lastName },
      type: 'NISM Approval',
      status: 'in-progress',
      progress: 10,
      currentStage: 'Deputy General Manager', // First approver in the fixed chain
      priority: 'Medium',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      dueDate: 'N/A',
      taskType: 'Initiated'
    });
  
    return { success: true };
}


/**
 * Fetches the details of a specific workflow instance.
 * @param id The ID of the workflow instance.
 * @returns A promise that resolves with the workflow data.
 */
export async function getInstance(id: string): Promise<Workflow> {
  console.log(`MOCK API: GET /api/workflows/${id}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const MOCK_USER_2 = MOCK_USERS[1] || MOCK_USERS[0];
  const MOCK_USER_3 = MOCK_USERS[2] || MOCK_USERS[0];

  return {
    id: id,
    title: 'Q1 Budget Approval',
    initiator: MOCK_USERS[0],
    department: 'Finance',
    status: 'in-progress',
    currentStep: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvers: [
        { id: MOCK_USER_2.username, name: `${MOCK_USER_2.firstName} ${MOCK_USER_2.lastName}`, type: 'user' },
        { id: MOCK_USER_3.username, name: `${MOCK_USER_3.firstName} ${MOCK_USER_3.lastName}`, type: 'user' },
    ],
    noteSheet: 'This is the detailed note sheet for the Q1 Budget Approval. We need to finalize the numbers by the end of the week. Please review the attached documents for a breakdown of projected expenses and revenue.',
    attachments: [
        { name: 'budget_proposal.pdf', url: '#', size: 1200000, type: 'application/pdf' },
        { name: 'revenue_forecast.xlsx', url: '#', size: 450000, type: 'application/vnd.ms-excel' },
    ],
    history: [
        { id: 'h1', user: { firstName: 'Jane', lastName: 'Doe', username: 'janedoe' }, action: 'Initiated Expense Report', timestamp: new Date().toISOString() },
    ],
  };
}

/**
 * Advances a workflow step by performing an action (e.g., approve, reject).
 * @param instanceId The ID of the workflow instance.
 * @param action The action to perform ('approve', 'reject', 'resubmit').
 * @param comment An optional comment.
 * @param signature An optional signature data URI.
 * @returns A promise that resolves on success.
 */
export async function advanceStep(
  instanceId: string,
  action: 'approve' | 'reject' | 'resubmit',
  comment?: string,
  signature?: string
): Promise<{ success: boolean }> {
  const payload = { action, comment, signature };
  console.log(`MOCK API: POST /api/workflows/${instanceId}/actions with payload:`, payload);

  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true };
}


/**
 * Fetches all tasks initiated by the current user.
 * @param userId The ID of the user.
 * @returns A promise that resolves with a list of tasks.
 */
export async function getInitiatedTasks(userId: string): Promise<Task[]> {
    console.log(`MOCK API: GET /api/users/${userId}/initiated-tasks`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would be an API call filtered by userId.
    // Here, we return all from the in-memory store.
    return [...initiatedWorkflows].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
}


/**
 * Fetches all tasks assigned to the current user.
 * @param userId The ID of the user.
 * @returns A promise that resolves with a list of tasks.
 */
export async function getMyTasks(userId: string): Promise<Task[]> {
    console.log(`MOCK API: GET /api/users/${userId}/my-tasks`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would be an API call filtered by userId.
    return [...myTasks].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
}
