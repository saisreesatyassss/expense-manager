'use server';

import { suggestApprovers as suggestApproversFlow, type SuggestApproversInput } from "@/ai/flows/predictive-approver-routing";

// This server action can be called from client components.
export async function getApproverSuggestions(input: SuggestApproversInput) {
    try {
        const result = await suggestApproversFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI suggestion failed:", error);
        return { success: false, error: "Failed to get suggestions from AI." };
    }
}
