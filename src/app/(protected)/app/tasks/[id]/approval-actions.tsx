
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X, Send, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Workflow, User } from '@/lib/types';
import { performTaskAction } from './actions';

const actionSchema = z.object({
    comment: z.string().optional(),
});

type ActionFormData = z.infer<typeof actionSchema>;

interface ApprovalActionsProps {
    workflow: Workflow;
    currentUser: User;
}

export function ApprovalActions({ workflow, currentUser }: ApprovalActionsProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ActionFormData>({
        resolver: zodResolver(actionSchema),
        defaultValues: { comment: '' }
    });
    
    const handleAction = async (action: 'approve' | 'reject') => {
        setIsSubmitting(true);
        const comment = form.getValues().comment;

        try {
            const result = await performTaskAction({
                workflowId: workflow.id,
                action,
                comment,
                currentUser,
            });

            if (result.success) {
                toast({
                    title: `Workflow ${action === 'approve' ? 'Approved' : 'Rejected'}`,
                    description: `The task has been moved to the next step.`,
                });
                router.push('/app/dashboard?tab=my-tasks');
                router.refresh(); // Important to get new server-side state
            } else {
                throw new Error(result.error || 'An unknown error occurred');
            }

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Action Failed',
                description: error instanceof Error ? error.message : "Could not complete the action."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Action</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-4">
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide your feedback or comments..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="destructive" onClick={() => handleAction('reject')} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <X className="mr-2"/>}
                                Reject
                            </Button>
                            <Button type="button" onClick={() => handleAction('approve')} disabled={isSubmitting}>
                                 {isSubmitting ? <Loader2 className="animate-spin" /> : <Check className="mr-2"/>}
                                Approve
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
