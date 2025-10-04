'use server';

/**
 * @fileOverview A helpful AI assistant for the FlowForm application.
 *
 * - appAssistant - A function that takes a user query and application context to provide helpful answers.
 * - AppAssistantInput - The input type for the appAssistant function.
 * - AppAssistantOutput - The return type for the appAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AppAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question or message.'),
  appContext: z.string().describe('A JSON string representing the current state of the application, including workflows, tasks, and user data.'),
});
export type AppAssistantInput = z.infer<typeof AppAssistantInputSchema>;

const AppAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user query.'),
});
export type AppAssistantOutput = z.infer<typeof AppAssistantOutputSchema>;

export async function appAssistant(input: AppAssistantInput): Promise<AppAssistantOutput> {
  return appAssistantFlow(input);
}

const appAssistantPrompt = ai.definePrompt({
  name: 'appAssistantPrompt',
  input: {schema: AppAssistantInputSchema},
  output: {schema: AppAssistantOutputSchema},
  prompt: `You are a helpful AI assistant for an application called "FlowForm".
Your role is to answer user questions based on the current state of the application, which is provided to you as a JSON string.

You can answer questions about:
- Workflows (their status, who the current approver is, etc.)
- Tasks (what tasks are pending, what has been initiated)
- Users (who is in what department, what their role is)

Analyze the user's query and the provided JSON context to formulate a helpful and accurate response.
If the data is not available in the context to answer the question, politely say so.
Keep your answers concise and to the point.

User Query: {{{query}}}

Application Context (JSON):
\`\`\`json
{{{appContext}}}
\`\`\`

Based on the query and context, provide a helpful response.
`,
});

const appAssistantFlow = ai.defineFlow(
  {
    name: 'appAssistantFlow',
    inputSchema: AppAssistantInputSchema,
    outputSchema: AppAssistantOutputSchema,
  },
  async input => {
    const {output} = await appAssistantPrompt(input);
    return output!;
  }
);
