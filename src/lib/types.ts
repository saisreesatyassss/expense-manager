
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  employeeId: string;
  mobile: string;
  designation: string;
  department: string;
  status: 'active' | 'disabled' | 'pending';
  role: 'user' | 'admin';
  avatarUrl?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
};

export type Approver = {
  id: string;
  name: string;
  type: 'user' | 'role';
};

export type Workflow = {
  id: string;
  title: string;
  initiator: Pick<User, 'id' | 'username' | 'firstName' | 'lastName'>;
  department: string;
  status: 'in-progress' | 'approved' | 'rejected' | 'finished';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  approvers: Approver[];
  noteSheet: string;
  attachments: Attachment[];
  history: AuditEvent[];
};

export type Task = {
  id: string;
  workflowId: string;
  title: string;
  initiator: Pick<User, 'firstName' | 'lastName'>;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed' | 'draft';
  taskType: 'My' | 'Pooled' | 'Finished' | 'Initiated';
  type?: 'Expense Report' | 'NISM Approval';
  progress?: number;
  currentStage?: string;
  priority?: 'High' | 'Medium' | 'Low';
  createdAt?: string;
};

export type Attachment = {
  name: string;
  size: number;
  type: string;
  url: string;
};

export type AuditEvent = {
  id: string;
  user: Pick<User, 'firstName' | 'lastName' | 'username'>;
  action: string;
  comment?: string;
  timestamp: string;
};

export type ReportParameters = {
  type: 'department' | 'user' | 'audit';
  filters: {
    startDate?: Date;
    endDate?: Date;
    department?: string;
    userId?: string;
    ipAddress?: string;
  };
};

export type MockUser = Omit<User, 'id'> & { id: string, password?: string };
