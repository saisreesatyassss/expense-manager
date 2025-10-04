'use server';

/**
 * @fileOverview An AI agent that suggests approvers for a new workflow based on historical data and user roles.
 *
 * - suggestApprovers - A function that takes workflow details and returns a list of suggested approvers.
 * - SuggestApproversInput - The input type for the suggestApprovers function.
 * - SuggestApproversOutput - The return type for the suggestApprovers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestApproversInputSchema = z.object({
  title: z.string().describe('The title of the workflow.'),
  department: z.string().describe('The department associated with the workflow.'),
  initiatorRole: z.string().describe('The role of the user initiating the workflow.'),
  noteSheet: z.string().describe('The content of the note sheet.'),
  previousApprovers: z.array(z.string()).optional().describe('List of previous approvers for similar workflows (usernames).'),
  availableApprovers: z.array(z.string()).describe('List of available approvers (usernames).'),
});
export type SuggestApproversInput = z.infer<typeof SuggestApproversInputSchema>;

const SuggestApproversOutputSchema = z.object({
  suggestedApprovers: z.array(z.string()).describe('A list of suggested approvers (usernames).'),
  reasoning: z.string().describe('Explanation of why these approvers were suggested.'),
});
export type SuggestApproversOutput = z.infer<typeof SuggestApproversOutputSchema>;

export async function suggestApprovers(input: SuggestApproversInput): Promise<SuggestApproversOutput> {
  return suggestApproversFlow(input);
}

const suggestApproversPrompt = ai.definePrompt({
  name: 'suggestApproversPrompt',
  input: {schema: SuggestApproversInputSchema},
  output: {schema: SuggestApproversOutputSchema},
  prompt: `You are an AI assistant designed to suggest approvers for new workflows.

  Based on the workflow's title, department, initiator role, note sheet content, historical approvers for similar workflows, and a list of available approvers, suggest a ranked list of approvers who are most likely to be appropriate for this workflow.

  Consider these factors:
  - Department relevance: Approvers from the same department are often relevant.
  - Role appropriateness: Certain roles are more appropriate for certain workflows.
  - Historical data: Previous approvers for similar workflows are likely candidates.
  - Note sheet content: Analyze the content to determine the expertise required for approval.

  Input:
  Workflow Title: {{{title}}}
  Department: {{{department}}}
  Initiator Role: {{{initiatorRole}}}
  Note Sheet Content: {{{noteSheet}}}
  Previous Approvers: {{#if previousApprovers}}{{#each previousApprovers}}- {{{this}}}{{/each}}{{else}}None{{/if}}
  Available Approvers: {{#each availableApprovers}}- {{{this}}}{{/each}}

  Output: Return a JSON object including a 'suggestedApprovers' key with a ranked list of usernames and a 'reasoning' key explaining the rationale behind the suggestions.
  Do not suggest approvers that are not present in the availableApprovers list.
  Limit the list of suggested approvers to maximum of 3.
  Make sure the returned object is parseable by JSON.parse.
  Example:
  {{
    "suggestedApprovers": ["user1", "user2"],
    "reasoning": "User1 is from the same department and has approved similar workflows. User2 has the appropriate role for this type of workflow."
  }}
  `,
});

const suggestApproversFlow = ai.defineFlow(
  {
    name: 'suggestApproversFlow',
    inputSchema: SuggestApproversInputSchema,
    outputSchema: SuggestApproversOutputSchema,
  },
  async input => {
    const {output} = await suggestApproversPrompt(input);
    return output!;
  }
);
