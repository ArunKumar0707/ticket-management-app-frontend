import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Ticket, TicketRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private api = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ticket[]> {
    return this.http.get<ApiResponse<Ticket[]>>(this.api).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.api}/${id}`).pipe(map(r => r.data));
  }

  create(req: TicketRequest): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(this.api, req).pipe(map(r => r.data));
  }

  update(id: number, req: TicketRequest): Observable<Ticket> {
    return this.http.put<ApiResponse<Ticket>>(`${this.api}/${id}`, req).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`).pipe(map(() => void 0));
  }
}
