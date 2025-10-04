
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  designation: z.string().min(1, 'Designation is required'),
  department: z.string().min(1, 'Department is required'),
  role: z.enum(['user', 'admin']),
  resetPasswordOnFirstLogin: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const smtpConfigSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.coerce.number().min(1, 'Port is required'),
    username: z.string().optional(),
    password: z.string().optional(),
});

const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(), // This would be the URL after upload
});

export const newWorkflowSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    department: z.string().min(1, 'Department is required'),
    startDate: z.date({
      required_error: "A start date is required.",
    }),
    noteSheet: z.string().min(15, 'Note sheet must contain at least 15 characters.'),
    approvers: z.array(z.object({
      id: z.string().min(1, 'Approver is required.'),
    })).min(1, 'At least one approver is required.'),
    attachments: z.array(fileSchema).optional(),
}).refine(data => {
  const approverIds = data.approvers.map(a => a.id);
  return new Set(approverIds).size === approverIds.length;
}, {
  message: 'Each approver must be unique.',
  path: ['approvers'],
});
