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

export interface ProjectDetail extends Project {
  tasks: ProjectTaskRecord[];
  workStreams: ProjectWorkStreamRecord[];
  clientContacts: ClientContactRecord[];
}

export interface ProjectTaskRecord {
  taskId: number;
  workStream: string;
  phase: string;
  category: string;
  taskName: string;
  subTasks: string[];
  employees: string[];
  startDate?: string | null;
  endDate?: string | null;
  initialPlanHours: number;
  taskType: string;
  isActive: boolean;
}

export interface ProjectWorkStreamRecord {
  workStreamId: number;
  workStreamName: string;
  phases: {
    phaseId: number;
    phaseName: string;
    onshoreManager?: string | null;
    offshoreManager?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
    efforts: { phaseEffortId: number; releaseName: string; estimatedHours: number }[];
  }[];
}

export interface ClientContactRecord {
  contactName: string;
  contactEmail: string;
  contactType: string;
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

  getProject(id: number): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.apiUrl}/${id}`);
  }

  updateProject(id: number, dto: CreateProjectDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
