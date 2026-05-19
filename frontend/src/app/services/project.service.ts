import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Project, ProjectRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private api = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(this.api).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.api}/${id}`).pipe(map(r => r.data));
  }

  create(req: ProjectRequest): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(this.api, req).pipe(map(r => r.data));
  }

  update(id: number, req: ProjectRequest): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.api}/${id}`, req).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`).pipe(map(() => void 0));
  }

  search(q: string): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.api}/search`, { params: { q } }).pipe(map(r => r.data));
  }
}
