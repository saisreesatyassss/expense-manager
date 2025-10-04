
import type { MockUser } from '@/lib/types';

export const DEPARTMENTS = [
  'Human Resources',
  'Finance',
  'Engineering',
  'Marketing',
  'Sales',
  'Legal',
  'Operations',
  'IT',
  'Administration',
  'Academic Affairs',
  'Finance & Accounts'
];

export const DESIGNATIONS = [
  'Initiator',
  'Immediate Approver Level 1',
  'Immediate Approver Level 2',
  'Final Approver',
  'System Administrator',
  'Deputy General Manager',
  'General Manager',
  'Deputy Director',
  'Director'
];

export const BASE_MOCK_USERS: MockUser[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Admin',
    username: 'admin',
    password: 'password',
    email: 'admin@company.com',
    employeeId: 'E00001',
    mobile: '123-456-7890',
    designation: 'Director',
    department: 'Administration',
    status: 'active',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
  },
  // Other mock users removed to ensure system starts with only an admin.
  // Users should be created via the user management UI.
];
