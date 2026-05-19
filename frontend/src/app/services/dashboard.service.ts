import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, DashboardStats, Ticket } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.api}/stats`).pipe(map(r => r.data));
  }

  getRecentTickets(limit = 10): Observable<Ticket[]> {
    return this.http.get<ApiResponse<Ticket[]>>(`${this.api}/recent-tickets`, { params: { limit } }).pipe(map(r => r.data));
  }
}
