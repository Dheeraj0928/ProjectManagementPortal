import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: number;
  code: string;
  customer: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  revisedEndDate?: string | null;
  renewalDate?: string | null;
  issueDate?: string | null;
  estimatedHours: number;
  actualHours?: number | null;
  onshoreManager: string;
  offshoreManager: string;
  status: string;
  createdAt?: string;
}

export interface CreateProjectDto {
  code: string;
  customer: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  revisedEndDate?: string | null;
  renewalDate?: string | null;
  issueDate?: string | null;
  estimatedHours: number;
  actualHours?: number | null;
  onshoreManager: string;
  offshoreManager: string;
  status: string;
}

export interface ProjectPage {
  items: Project[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalProjects: number;
  statusCounts: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  private apiUrl = 'http://localhost:5211/api/projects';

  constructor(private http: HttpClient) {}

  getProjects(
    pageNumber = 1,
    pageSize = 10,
    searchText = '',
    searchColumn = 'all',
    status = 'All'
  ): Observable<ProjectPage> {
    return this.http.get<ProjectPage>(this.apiUrl, {
      params: { pageNumber, pageSize, searchText, searchColumn, status }
    });
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, dto);
  }

  updateProject(id: number, dto: CreateProjectDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
