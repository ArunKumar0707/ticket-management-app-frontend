// ── Ticket ────────────────────────────────────────────────
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  projectId?: number;
  projectName?: string;
  assigneeId?: number;
  assigneeName?: string;
}

export interface TicketRequest {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  projectId?: number | null;
  assigneeId?: number | null;
}

// ── Project ───────────────────────────────────────────────
export type ProjectStatus = 'ACTIVE' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: number;
  projectName: string;
  projectDescription: string;
  projectStatus: ProjectStatus;
  projectOwner: string;
  createdAt: string;
  updatedAt: string;
  ticketCount: number;
}

export interface ProjectRequest {
  projectName: string;
  projectDescription: string;
  projectStatus: ProjectStatus;
  projectOwner: string;
}

// ── Employee ──────────────────────────────────────────────
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  id: number;
  employeeName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
  assignedTicketCount: number;
}

export interface EmployeeRequest {
  employeeName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  status: EmployeeStatus;
}

// ── Dashboard ─────────────────────────────────────────────
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  highPriorityTickets: number;
  mediumPriorityTickets: number;
  lowPriorityTickets: number;
  totalProjects: number;
  activeProjects: number;
  totalEmployees: number;
  activeEmployees: number;
}

// ── API Response ──────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
