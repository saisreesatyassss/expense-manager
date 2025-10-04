
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  Loader2,
  Sparkles,
  Eye,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { format, addDays } from "date-fns";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FileUploader } from "./file-uploader";
import { Separator } from "../ui/separator";
import type { User, Task, Workflow, Approver } from "@/lib/types";
import { RichTextEditor } from "../ui/rich-text-editor";
import { newWorkflowSchema } from "@/lib/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface NewWorkflowFormProps {
  availableApprovers: User[];
  departments: string[];
  initiator: User | null;
}

type FormData = z.infer<typeof newWorkflowSchema>;

export function NewWorkflowForm({
  availableApprovers,
  departments,
  initiator,
}: NewWorkflowFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(newWorkflowSchema),
    defaultValues: {
      title: "",
      department: initiator?.department || "",
      noteSheet: "",
      approvers: [],
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "approvers",
  });

  const getApproverById = (id: string): Approver | undefined => {
    const user = availableApprovers.find(u => u.username === id);
    if (!user) return undefined;
    return { id: user.username, name: `${user.firstName} ${user.lastName}`, type: 'user' };
  }

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const workflowId = `WF-${Date.now()}`;
      
      const workflowInitiator: Pick<User, 'id' | 'username' | 'firstName' | 'lastName'> = initiator 
        ? { id: initiator.id, username: initiator.username, firstName: initiator.firstName, lastName: initiator.lastName }
        : { id: 'public', username: 'public', firstName: 'Public', lastName: 'User' };

      const approvers: Approver[] = values.approvers.map(a => getApproverById(a.id)).filter((a): a is Approver => a !== undefined);

      if (approvers.length !== values.approvers.length) {
        throw new Error("One or more selected approvers could not be found. Please review the approval chain.");
      }

      const newWorkflow: Workflow = {
        id: workflowId,
        title: values.title,
        initiator: workflowInitiator,
        department: values.department,
        status: 'in-progress',
        currentStep: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvers: approvers,
        noteSheet: values.noteSheet,
        attachments: values.attachments || [],
        history: [{
          id: `hist-${Date.now()}`,
          user: { firstName: workflowInitiator.firstName, lastName: workflowInitiator.lastName, username: workflowInitiator.username },
          action: 'Initiated Expense Report',
          timestamp: new Date().toISOString()
        }]
      };

      // 1. Save the full workflow object
      const workflowsCookie = Cookies.get('workflows') || '{}';
      const workflows = JSON.parse(workflowsCookie);
      workflows[workflowId] = newWorkflow;
      Cookies.set('workflows', JSON.stringify(workflows), { expires: 7, path: '/' });

      // 2. Create the initiated task for the initiator (if they are logged in)
      if (initiator) {
        const initiatedTask: Task = {
          id: `task-init-${workflowId}`,
          workflowId: workflowId,
          title: values.title,
          initiator: { firstName: initiator.firstName, lastName: initiator.lastName },
          type: 'Expense Report',
          status: 'in-progress',
          progress: 10,
          currentStage: newWorkflow.approvers[0]?.name || 'Initial Review',
          priority: 'Medium',
          createdAt: format(new Date(), 'yyyy-MM-dd'),
          dueDate: 'N/A',
          taskType: 'Initiated'
        };
        
        const initiatedCookie = Cookies.get('initiatedWorkflows') || '[]';
        const initiatedTasks = JSON.parse(initiatedCookie);
        initiatedTasks.push(initiatedTask);
        Cookies.set('initiatedWorkflows', JSON.stringify(initiatedTasks), { expires: 7, path: '/' });
      }

      // 3. Create the first "My Task" for the first approver
      const firstApproverUsername = newWorkflow.approvers[0]?.id;
      if (firstApproverUsername) {
          const firstApproverTask: Task = {
              id: `task-my-${workflowId}`,
              workflowId: workflowId,
              title: values.title,
              initiator: { firstName: workflowInitiator.firstName, lastName: workflowInitiator.lastName },
              dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
              status: 'pending',
              taskType: 'My'
          };
          
          const myTasksCookieName = `myTasks_${firstApproverUsername}`;
          const myTasksCookie = Cookies.get(myTasksCookieName) || '[]';
          const myTasks = JSON.parse(myTasksCookie);
          myTasks.push(firstApproverTask);
          Cookies.set(myTasksCookieName, JSON.stringify(myTasks), { expires: 7, path: '/' });
      }

      toast({
          title: "Expense Report Submitted!",
          description: initiator ? `Your expense report (ID: ${workflowId}) has been successfully submitted.` : 'Your expense has been submitted. Please login to track its status.',
      });
      
      router.push(initiator ? "/app/dashboard?tab=initiated-tasks" : "/login");
      router.refresh();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    
    // Simulate getting suggestions by picking random users
    await new Promise(resolve => setTimeout(resolve, 500));

    const shuffled = [...availableApprovers].sort(() => 0.5 - Math.random());
    const suggestedUsers = shuffled.slice(0, Math.min(3, shuffled.length));
    
    form.setValue('approvers', suggestedUsers.map(u => ({ id: u.username })));
    
    toast({
        title: "Approvers Suggested!",
        description: "A random set of approvers has been added to the chain."
    });

    setIsSuggesting(false);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "IN";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title / Purpose</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q3 Client Meeting Travel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Expense Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Expense Description & Justification</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                control={form.control}
                name="noteSheet"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <RichTextEditor
                           value={field.value}
                           onChange={field.onChange}
                        />
                    </FormControl>
                    <FormDescription>
                        This content will be visible to all approvers.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Receipts & Attachments</CardTitle>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Files</FormLabel>
                            <FormControl>
                                <FileUploader
                                    value={field.value}
                                    onValueChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Approval Chain</CardTitle>
                <CardDescription>Add one or more approvers in the desired order.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleGetSuggestions} disabled={isSuggesting}>
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Suggest
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {initiator && (
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <span className="font-mono text-sm text-muted-foreground">Start</span>
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={initiator.avatarUrl} />
                        <AvatarFallback>{getInitials(initiator.firstName, initiator.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-medium text-sm">{initiator.firstName} {initiator.lastName}</p>
                        <p className="text-xs text-muted-foreground">Initiator</p>
                    </div>
                </div>
            )}
            {fields.map((field, index) => {
              const selectedApprovers = form.watch('approvers').map(a => a.id);
              const availableOptions = availableApprovers.filter(
                u => !selectedApprovers.includes(u.username) || selectedApprovers[index] === u.username
              );

              return (
                <div key={field.id} className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground">{index + 1}.</span>
                  <FormField
                    control={form.control}
                    name={`approvers.${index}.id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an approver" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableOptions.map((approver) => (
                              <SelectItem key={approver.id} value={approver.username}>
                                {approver.firstName} {approver.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
             <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ id: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Approver
            </Button>
            {form.formState.errors.approvers && (
                <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.approvers.message || (form.formState.errors.approvers.root && form.formState.errors.approvers.root.message)}
                </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Form (Preview)
                    </Button>
                </DialogTrigger>
                <PreviewDialogContent formData={form.watch()} availableApprovers={availableApprovers} />
            </Dialog>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
            </Button>
        </div>
      </form>
    </Form>
  );
}


function PreviewDialogContent({ formData, availableApprovers }: { formData: Partial<FormData>, availableApprovers: User[] }) {
    const getApproverName = (id?: string) => {
        if (!id) return 'Not selected';
        const user = availableApprovers.find(u => u.username === id);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    }

    const approvers = formData.approvers?.map(a => getApproverName(a.id)) || [];

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Expense Report Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Expense Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="font-medium text-muted-foreground">Title:</span> {formData.title || 'Not set'}</p>
                        <p><span className="font-medium text-muted-foreground">Department:</span> {formData.department || 'Not set'}</p>
                        <p><span className="font-medium text-muted-foreground">Expense Date:</span> {formData.startDate ? format(formData.startDate, "PPP") : 'Not set'}</p>
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Description & Justification</h3>
                    <div 
                        className="prose prose-sm max-w-none dark:prose-invert rounded-md border p-4"
                        dangerouslySetInnerHTML={{ __html: formData.noteSheet || '<p class="text-muted-foreground">No content.</p>' }} 
                    />
                </div>
                
                <Separator />

                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Attachments</h3>
                    {formData.attachments && formData.attachments.length > 0 ? (
                        <ul className="list-disc list-inside text-sm">
                            {formData.attachments.map((file, index) => (
                                <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No attachments.</p>
                    )}
                </div>

                <Separator />

                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Approval Chain</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        {approvers.map((approver, index) => (
                           <li key={index}>{approver}</li>
                        ))}
                    </ol>
                </div>

            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}
