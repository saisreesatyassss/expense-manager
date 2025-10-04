
'use server';

import { userFormSchema } from "@/lib/schemas";
import { z } from "zod";
import type { User } from "@/lib/types";
import { saveUser } from "@/services/user-service";
import { revalidatePath } from "next/cache";

type UserFormData = z.infer<typeof userFormSchema>;

export async function addUser(formData: UserFormData): Promise<{ success: boolean, error?: string }> {
    try {
        const validatedData = userFormSchema.parse(formData);

        // The saveUser function will handle checking for duplicates and saving.
        const result = await saveUser(validatedData);

        if (!result.success) {
            return { success: false, error: result.error };
        }
        
        console.log("A new user has been saved:", result.user);

        // Revalidate the path to ensure the user list is updated on the client.
        revalidatePath('/protected/admin/users/list');
        revalidatePath('/login');

        return { success: true };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors.map(e => e.message).join(', ') };
        }
        console.error("Failed to add user:", error);
        return { success: false, error: error instanceof Error ? error.message : "An unknown server error occurred." };
    }
}
