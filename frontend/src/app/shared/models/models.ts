export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum Priority {
  P1_CRITICAL = 'P1_CRITICAL',
  P2_HIGH = 'P2_HIGH',
  P3_MEDIUM = 'P3_MEDIUM',
  P4_LOW = 'P4_LOW'
}

export enum SupportLevel {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3'
}

export enum Role {
  ADMIN = 'ADMIN',
  SUPPORT_ENGINEER = 'SUPPORT_ENGINEER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  projectCode: string;
  isActive: boolean;
  createdAt: string;
  ticketCount?: number;
}

export interface Comment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  authorRole: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface HistoryItem {
  id: number;
  fieldName: string;
  oldValue: string;
  newValue: string;
  description: string;
  changedById: number;
  changedByName: string;
  changedAt: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  issueDescription: string;
  projectId: number;
  projectName: string;
  assignedToId?: number;
  assignedToName?: string;
  createdById: number;
  createdByName: string;
  supportLevel: SupportLevel;
  priority: Priority;
  generationDateTime: string;
  responseDateTime?: string;
  resolutionDateTime?: string;
  resolutionTimeMinutes?: number;
  resolutionTimeFormatted?: string;
  currentStatus: TicketStatus;
  resolutionDetails?: string;
  remarks?: string;
  slaBreached: boolean;
  slaDueDateTime: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  history?: HistoryItem[];
  attachments?: Attachment[];
}

export interface TicketRequest {
  projectId: number;
  issueDescription: string;
  assignedToId?: number;
  supportLevel: SupportLevel;
  priority: Priority;
  currentStatus?: TicketStatus;
  resolutionDetails?: string;
  remarks?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any;
  timestamp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  expiresIn: number;
}

export interface DashboardData {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  criticalTickets: number;
  slaBreachedTickets: number;
  avgResolutionTimeMinutes: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  monthlyTrends: { month: string; count: number }[];
  employeeWorkload: { employeeName: string; ticketCount: number }[];
}

export interface TicketFilter {
  ticketNumber?: string;
  projectId?: number;
  assignedToId?: number;
  priority?: string;
  status?: string;
  supportLevel?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}
export interface ProjectRequest {
  name: string;
  description?: string;
  status?: string;
}
