
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Eye, Save, Send } from "lucide-react";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User, Task, Workflow } from "@/lib/types";

const nismApprovalSchema = z.object({
    fromDepartment: z.string().min(1, 'From department is required'),
    toDepartment: z.string().min(1, 'To department is required'),
    subject: z.string().min(3, 'Subject is required'),
    details: z.string().min(10, 'Details are required'),
    remarks: z.string().optional(),
});

type FormData = z.infer<typeof nismApprovalSchema>;

interface NismApprovalFormProps {
    departments: string[];
    fileNumber: string;
    predefinedApprovers: {
        user: User;
        role: string;
        department: string;
    }[];
    initiator: User | null;
    isSubmittable: boolean;
}

export function NismApprovalForm({ departments, fileNumber, predefinedApprovers, initiator, isSubmittable }: NismApprovalFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<FormData>({
        resolver: zodResolver(nismApprovalSchema),
        defaultValues: {
            fromDepartment: initiator?.department || "",
            toDepartment: "",
            subject: "",
            details: "",
            remarks: "",
        },
    });

    async function onSubmit(values: FormData) {
        if (!isSubmittable) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Cannot submit workflow, required approvers are missing.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const initiatorInfo = initiator 
              ? { firstName: initiator.firstName, lastName: initiator.lastName }
              : { firstName: 'Public', lastName: 'User' };

            const newNismTask: Task = {
                id: fileNumber,
                workflowId: fileNumber,
                title: values.subject,
                initiator: initiatorInfo,
                type: 'NISM Approval',
                status: 'in-progress',
                progress: 10,
                currentStage: 'Deputy General Manager', // First fixed approver
                priority: 'Medium',
                createdAt: new Date().toISOString(),
                dueDate: 'N/A',
                taskType: 'Initiated'
            };

            const initiatedWorkflowsCookie = Cookies.get('initiatedWorkflows');
            const initiatedWorkflows = initiatedWorkflowsCookie ? JSON.parse(initiatedWorkflowsCookie) : [];
            initiatedWorkflows.push(newNismTask);
            Cookies.set('initiatedWorkflows', JSON.stringify(initiatedWorkflows), { expires: 7, path: '/' });

            const newWorkflow: Workflow = {
              id: fileNumber,
              title: values.subject,
              initiator: initiator || { id: 'public', username: 'public', firstName: 'Public', lastName: 'User', email: '', employeeId: '', mobile: '', designation: '', department: '', status: 'active', role: 'user' },
              department: values.fromDepartment,
              status: 'in-progress',
              currentStep: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              approvers: predefinedApprovers.map(a => ({ id: a.user.username, name: `${a.user.firstName} ${a.user.lastName}`, type: 'user' })),
              noteSheet: values.details,
              attachments: [],
              history: [{
                id: `hist-${Date.now()}`,
                user: { firstName: initiatorInfo.firstName, lastName: initiatorInfo.lastName, username: initiator?.username || 'public' },
                action: 'Initiated Workflow',
                timestamp: new Date().toISOString()
              }]
            };

            const workflowsCookie = Cookies.get('workflows') || '{}';
            const workflows = JSON.parse(workflowsCookie);
            workflows[fileNumber] = newWorkflow;
            Cookies.set('workflows', JSON.stringify(workflows), { expires: 7, path: '/' });

            toast({
                title: "Note Submitted!",
                description: "Your NISM Approval Note has been submitted. You can track it in your initiated tasks.",
            });
            router.push(initiator ? "/app/dashboard?tab=initiated-tasks" : "/login");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error instanceof Error ? error.message : "An unknown error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const allButtonsDisabled = isSubmitting || !isSubmittable;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle>Note Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <FormLabel>File Number</FormLabel>
                                <Input value={fileNumber} readOnly disabled className="mt-2"/>
                            </div>
                            <div>
                                <FormLabel>Date</FormLabel>
                                <Input value={format(new Date(), "dd/MM/yyyy")} readOnly disabled className="mt-2" />
                            </div>
                            <div>
                                <FormLabel>Priority</FormLabel>
                                <Input value="Medium" readOnly disabled className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="fromDepartment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Department *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                                            <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="toDepartment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Department *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                                            <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject *</FormLabel>
                                    <FormControl><Input placeholder="Enter the subject of the approval note" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="details"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Details *</FormLabel>
                                    <FormControl><Textarea placeholder="Enter the detailed content of the approval note..." className="min-h-[150px]" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Remarks</FormLabel>
                                    <FormControl><Textarea placeholder="Enter any additional remarks or instructions..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Approval Workflow</CardTitle></CardHeader>
                    <CardContent>
                        <ol className="relative border-l border-border ml-2">                  
                            {predefinedApprovers.map((approver, index) => (
                                <li key={index} className="mb-8 ml-6">
                                    <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-muted-foreground/20 ring-4 ring-background">
                                    </span>
                                    <h3 className="font-semibold text-primary">{approver.role}</h3>
                                    <p className="text-sm">{approver.user.firstName} {approver.user.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{approver.department}</p>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-8">
                    <Button type="button" variant="outline" disabled={allButtonsDisabled}><Save className="mr-2 h-4 w-4" />Save as Draft</Button>
                    <Button type="button" variant="secondary" disabled={allButtonsDisabled}><Eye className="mr-2 h-4 w-4" />Preview Note</Button>
                    <Button type="submit" disabled={allButtonsDisabled}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit for Approval
                    </Button>
                </div>
            </form>
        </Form>
    );
}
