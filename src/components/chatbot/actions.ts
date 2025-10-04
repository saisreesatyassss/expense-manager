'use server';

import { cookies } from 'next/headers';
import { appAssistant } from '@/ai/flows/app-assistant-flow';

export async function getChatbotResponse(query: string): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
        const cookieStore = cookies();
        
        // Gather all relevant data from cookies
        const usersCookie = cookieStore.get('users_data')?.value || '[]';
        const workflowsCookie = cookieStore.get('workflows')?.value || '{}';
        
        const authToken = cookieStore.get('auth_token')?.value;
        let myTasksCookie = '[]';
        if (authToken) {
            const [_, username] = authToken.split(':');
            myTasksCookie = cookieStore.get(`myTasks_${username}`)?.value || '[]';
        }
        
        const initiatedWorkflowsCookie = cookieStore.get('initiatedWorkflows')?.value || '[]';

        // Combine into a single context object
        const appContext = {
            users: JSON.parse(usersCookie),
            workflows: JSON.parse(workflowsCookie),
            myTasks: JSON.parse(myTasksCookie),
            initiatedWorkflows: JSON.parse(initiatedWorkflowsCookie),
        };

        const result = await appAssistant({
            query,
            appContext: JSON.stringify(appContext, null, 2),
        });

        return { success: true, response: result.response };
    } catch (error) {
        console.error("Chatbot action failed:", error);
        return { success: false, error: "I'm sorry, I couldn't process that request." };
    }
}
