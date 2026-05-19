import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Employee, EmployeeRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Employee[]> {
    return this.http.get<ApiResponse<Employee[]>>(this.api).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<ApiResponse<Employee>>(`${this.api}/${id}`).pipe(map(r => r.data));
  }

  create(req: EmployeeRequest): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.api, req).pipe(map(r => r.data));
  }

  update(id: number, req: EmployeeRequest): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.api}/${id}`, req).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`).pipe(map(() => void 0));
  }

  search(q: string): Observable<Employee[]> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.api}/search`, { params: { q } }).pipe(map(r => r.data));
  }
}
