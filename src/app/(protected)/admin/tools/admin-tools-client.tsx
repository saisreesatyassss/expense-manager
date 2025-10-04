"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Mail, Save, Database } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { smtpConfigSchema } from "@/lib/schemas"; // Assuming this schema will be created

const systemSettingsSchema = z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    autoApprovalReminders: z.boolean(),
    auditLogging: z.boolean(),
    sessionTimeout: z.coerce.number().min(5, "Timeout must be at least 5 minutes"),
    maxFileSize: z.coerce.number().min(1, "Max file size must be at least 1 MB"),
});

type SmtpFormData = z.infer<typeof smtpConfigSchema>;
type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;

export function AdminToolsClient() {
    const { toast } = useToast();
    const [isSavingSmtp, setIsSavingSmtp] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const smtpForm = useForm<SmtpFormData>({
        resolver: zodResolver(smtpConfigSchema),
        defaultValues: {
            host: "smtp.company.com",
            port: 587,
            username: "admin@company.com",
            password: "",
        },
    });

    const settingsForm = useForm<SystemSettingsFormData>({
        resolver: zodResolver(systemSettingsSchema),
        defaultValues: {
            emailNotifications: true,
            smsNotifications: false,
            autoApprovalReminders: true,
            auditLogging: true,
            sessionTimeout: 60,
            maxFileSize: 10,
        },
    });

    async function onSmtpSubmit(values: SmtpFormData) {
        setIsSavingSmtp(true);
        console.log("SMTP settings submitted:", values);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({ title: "SMTP Configuration Saved", description: "Your email server settings have been updated." });
        setIsSavingSmtp(false);
    }

    async function onSettingsSubmit(values: SystemSettingsFormData) {
        setIsSavingSettings(true);
        console.log("System settings submitted:", values);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({ title: "System Settings Saved", description: "Your system preferences have been updated." });
        setIsSavingSettings(false);
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
                <Form {...smtpForm}>
                    <form onSubmit={smtpForm.handleSubmit(onSmtpSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>SMTP Configuration</CardTitle>
                                <CardDescription>Configure email server settings for notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField control={smtpForm.control} name="host" render={({ field }) => (
                                        <FormItem><FormLabel>SMTP Host</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={smtpForm.control} name="port" render={({ field }) => (
                                        <FormItem><FormLabel>SMTP Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={smtpForm.control} name="username" render={({ field }) => (
                                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input autoComplete="username" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={smtpForm.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Enter SMTP password" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline"><Mail className="mr-2"/> Send Test Email</Button>
                                <Button type="submit" disabled={isSavingSmtp}>
                                    {isSavingSmtp && <Loader2 className="mr-2 animate-spin" />}
                                    Save Configuration
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>

                 <Card>
                    <CardHeader>
                        <CardTitle>Database Tools</CardTitle>
                        <CardDescription>Database maintenance and backup utilities</CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-3 gap-4">
                        <Button variant="outline"><Database className="mr-2"/>Backup Database</Button>
                        <Button variant="outline" className="text-destructive hover:text-destructive"><Database className="mr-2"/>Clear Audit Logs</Button>
                        <Button variant="outline"><Database className="mr-2"/>Optimize Tables</Button>
                    </CardContent>
                </Card>
            </div>

            <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>System Settings</CardTitle>
                            <CardDescription>Configure system behavior and preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={settingsForm.control} name="emailNotifications" render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <FormLabel>Email Notifications</FormLabel>
                                        <FormDescription>Send email notifications for workflow updates</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={settingsForm.control} name="smsNotifications" render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <FormLabel>SMS Notifications</FormLabel>
                                        <FormDescription>Send SMS notifications for urgent approvals</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={settingsForm.control} name="autoApprovalReminders" render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <FormLabel>Auto Approval Reminders</FormLabel>
                                        <FormDescription>Automatically send reminder emails for pending approvals</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                             )} />
                             <FormField control={settingsForm.control} name="auditLogging" render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <FormLabel>Audit Logging</FormLabel>
                                        <FormDescription>Enable detailed system audit logging</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                             )} />
                             <div className="grid sm:grid-cols-2 gap-4">
                                <FormField control={settingsForm.control} name="sessionTimeout" render={({ field }) => (
                                    <FormItem><FormLabel>Session Timeout (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={settingsForm.control} name="maxFileSize" render={({ field }) => (
                                    <FormItem><FormLabel>Max File Size (MB)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                             </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSavingSettings} className="ml-auto">
                                {isSavingSettings && <Loader2 className="mr-2 animate-spin" />}
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
