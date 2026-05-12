import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, Ticket, TicketRequest, TicketFilter,
  PageResponse, User, Project, ProjectRequest,
  DashboardData
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class TicketApiService {
  private readonly API = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  createTicket(request: TicketRequest): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(this.API, request);
  }

  updateTicket(id: number, request: TicketRequest): Observable<ApiResponse<Ticket>> {
    return this.http.put<ApiResponse<Ticket>>(`${this.API}/${id}`, request);
  }

  getTicketById(id: number): Observable<ApiResponse<Ticket>> {
    return this.http.get<ApiResponse<Ticket>>(`${this.API}/${id}`);
  }

  getAllTickets(filter: TicketFilter): Observable<ApiResponse<PageResponse<Ticket>>> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(this.API, { params });
  }

  getMyTickets(page = 0, size = 10): Observable<ApiResponse<PageResponse<Ticket>>> {
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${this.API}/my-tickets`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getAssignedTickets(page = 0, size = 10): Observable<ApiResponse<PageResponse<Ticket>>> {
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${this.API}/assigned-to-me`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  deleteTicket(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }

  assignTicket(ticketId: number, userId: number): Observable<ApiResponse<Ticket>> {
    return this.http.patch<ApiResponse<Ticket>>(`${this.API}/${ticketId}/assign`, null, {
      params: new HttpParams().set('userId', userId)
    });
  }

  updateStatus(ticketId: number, status: string, resolutionDetails?: string): Observable<ApiResponse<Ticket>> {
    return this.http.patch<ApiResponse<Ticket>>(`${this.API}/${ticketId}/status`, { status, resolutionDetails });
  }

  addComment(ticketId: number, content: string, isInternal = false): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(`${this.API}/${ticketId}/comments`, { content, isInternal });
  }

  uploadAttachment(ticketId: number, file: File): Observable<ApiResponse<Ticket>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<Ticket>>(`${this.API}/${ticketId}/attachments`, formData);
  }

  exportExcel(status?: string, priority?: string): Observable<Blob> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    return this.http.get(`${this.API}/export/excel`, { params, responseType: 'blob' });
  }
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.API);
  }

  getSupportEngineers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.API}/support-engineers`);
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API}/${id}`);
  }

  createUser(data: any): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.API, data);
  }

  updateUser(id: number, data: any): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API}/${id}`, data);
  }

  toggleUserStatus(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API}/${id}/toggle-status`, null);
  }

  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly API = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getActiveProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(this.API);
  }

  getAllProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(`${this.API}/all`);
  }

  createProject(data: any): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.API, data);
  }

  updateProject(id: number, data: any): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.API}/${id}`, data);
  }

  deleteProject(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly API = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(this.API);
  }
}
