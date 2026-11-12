import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectForm } from './components/project-form/project-form';
import { NavMenu, MenuItem } from './components/nav-menu/nav-menu';
import { Pagination } from './components/pagination/pagination';
import { Resources } from './components/resources/resources';
import { Profile } from './components/profile/profile';
import { ProjectDetails } from './components/project-details/project-details';
import { ProjectService, CreateProjectDto } from './services/project';

import {
  LucideHouse, LucideFolderKanban, LucideUsers, LucideChartNoAxesCombined,
  LucideContactRound, LucideShieldCheck, LucideCalendarClock, LucideChevronDown,
  LucideList, LucideSlidersHorizontal, LucidePlus, LucideX, LucideSave,
  LucidePencil, LucideTrash2, LucideSearch, LucideRotateCcw,
  LucideCircleCheck, LucideCircleAlert
} from '@lucide/angular';

interface ProjectRow {
  id: number;
  code: string;
  customer: string;
  name: string;
  startDate?: string;
  endDate?: string;
  revisedEndDate?: string;
  renewalDate?: string;
  issueDate?: string;
  estimatedHours: number;
  actualHours: number | null;
  onshoreManager: string;
  offshoreManager: string;
  status: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ProjectForm, Pagination, NavMenu, Resources, Profile, ProjectDetails, FormsModule, CommonModule, LucideHouse, LucideFolderKanban, LucideUsers,
    LucideChartNoAxesCombined, LucideContactRound, LucideShieldCheck,
    LucideCalendarClock, LucideChevronDown, LucideList, LucideSlidersHorizontal,
    LucidePlus, LucideX, LucideSave, LucidePencil, LucideTrash2, LucideSearch,
    LucideRotateCcw, LucideCircleCheck, LucideCircleAlert
  ],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  allocationMenu: MenuItem[] = [
  {
    "label": "Approve Allocation"
  },
  {
    "label": "Resource Allocation"
  },
  {
    "label": "Bulk Allocation"
  }
];
  reportMenu: MenuItem[] = [
  {
    "label": "My Reports"
  },
  {
    "label": "Project Status",
    "children": [
      {
        "label": "Bi-Weekly Status Report"
      }
    ]
  },
  {
    "label": "Timesheet & Effort"
  },
  {
    "label": "Billing"
  },
  {
    "label": "Resource Planning"
  }
];
  adminMenu: MenuItem[] = [
  {
    "label": "Role Management"
  },
  {
    "label": "Rate Management"
  },
  {
    "label": "Holiday Management"
  },
  {
    "label": "Project Status Report Configuration"
  },
  {
    "label": "Bi-Weekly Report Actual Hours Configuration"
  },
  {
    "label": "Permission Management"
  },
  {
    "label": "Client Management"
  }
];
  timesheetMenu: MenuItem[] = [
  {
    "label": "Timesheet Entry"
  },
  {
    "label": "Timesheet Approval"
  }
];
  selectedPage = '';
  selectedProject: ProjectRow | null = null;

  openPage(page: string): void {
    this.selectedProject = null;
    this.selectedPage = page;
  }

  openProject(project: ProjectRow): void {
    this.selectedProject = project;
    this.selectedPage = '';
    this.changeDetector.detectChanges();
    window.scrollTo({ top: 0 });
  }

  projects: ProjectRow[] = [];
  loading = false;
  errorMessage = '';
  showFilters = true;
  showCreateForm = false;
  searchText = '';
  columns = [
    { key: 'code', label: 'Project Code', visible: true },
    { key: 'customer', label: 'Customer Name', visible: true },
    { key: 'name', label: 'Project Name', visible: true },
    { key: 'startDate', label: 'Start Date', visible: true },
    { key: 'endDate', label: 'End Date', visible: true },
    { key: 'revisedEndDate', label: 'Revised End Date', visible: true },
    { key: 'renewalDate', label: 'Renewal Date', visible: true },
    { key: 'issueDate', label: 'Issue Date', visible: true },
    { key: 'estimatedHours', label: 'Estimated Hours', visible: true },
    { key: 'actualHours', label: 'Actual Hours', visible: true },
    { key: 'onshoreManager', label: 'Onshore Manager', visible: true },
    { key: 'offshoreManager', label: 'Offshore Manager', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];
  filterStatus = 'All';
  successMessage = '';
  editProject: ProjectRow | null = null;
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalProjects = 0;
  statusCounts: Record<string, number> = {};
  private projectsRequest?: Subscription;
  private successTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private projectService: ProjectService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProject();
  }

  ngOnDestroy(): void {
    this.projectsRequest?.unsubscribe();
    clearTimeout(this.successTimer);
  }

  loadProject(): void {
    this.projectsRequest?.unsubscribe();
    this.loading = true;
    this.errorMessage = '';

    this.projectsRequest = this.projectService.getProjects(
      this.currentPage,
      this.pageSize,
      this.searchText,
      'all',
      this.filterStatus
    ).subscribe({
      next: (data) => {
        this.currentPage = data.pageNumber;
        this.totalCount = data.totalCount;
        this.totalProjects = data.totalProjects;
        this.statusCounts = data.statusCounts;
        this.projects = data.items.map(project => ({
          id: project.id,
          code: project.code,
          customer: project.customer,
          name: project.name,
          startDate: project.startDate?.split('T')[0] ?? '',
          endDate: project.endDate?.split('T')[0] ?? '',
          revisedEndDate: project.revisedEndDate?.split('T')[0] ?? '',
          renewalDate: project.renewalDate?.split('T')[0] ?? '',
          issueDate: project.issueDate?.split('T')[0] ?? '',
          estimatedHours: project.estimatedHours,
          actualHours: project.actualHours ?? null,
          onshoreManager: project.onshoreManager,
          offshoreManager: project.offshoreManager,
          status: project.status
        }));

        this.loading = false;
        this.changeDetector.markForCheck();
      },

      error: () => {
        this.projects = [];
        this.totalCount = 0;
        this.errorMessage = 'Projects not loaded. Check the backend.';
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  get visibleColumnCount(): number {
    return this.columns.filter(column => column.visible).length;
  }

  isColumnVisible(key: string): boolean {
    return this.columns.some(column => column.key === key && column.visible);
  }

  getStatusCount(status: string): number {
    if (status === 'All') {
      return this.totalProjects;
    }
    return this.statusCounts[status] ?? 0;
  }

  changePage(page: number): void {
    const totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
    if (this.loading || page < 1 || page > totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadProject();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProject();
  }

  selectStatus(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.columns.forEach(column => column.visible = true);
    this.filterStatus = 'All';
    this.applyFilters();
  }
  showSuccess(message: string): void {
    clearTimeout(this.successTimer);
    this.successMessage = message;
    this.changeDetector.markForCheck();
    this.successTimer = setTimeout(() => {
      this.successMessage = '';
      this.changeDetector.markForCheck();
    }, 5000);
  }

  startEdit(project: ProjectRow): void {
    this.selectedProject = null;
    this.editProject = { ...project };
  }
  cancelEdit(): void {
    this.editProject = null;
  }
  saveEdit(): void {
    if (!this.editProject) {
      return;
    }
    const project = this.editProject;
    if (
      !project.code.trim() || !project.customer.trim() || !project.name.trim()) {
      alert('project code, Customer Name, Project Name is required');
      return;
    }
    const dto: CreateProjectDto = {
      code: project.code.trim(),
      customer: project.customer.trim(),
      name: project.name.trim(),
      startDate: project.startDate || null,
      endDate: project.endDate || null,
      revisedEndDate: project.revisedEndDate || null,
      renewalDate: project.renewalDate || null,
      issueDate: project.issueDate || null,
      estimatedHours: project.estimatedHours,
      actualHours: project.actualHours,
      offshoreManager: project.offshoreManager.trim(),
      onshoreManager: project.onshoreManager.trim(),
      status: project.status
    };
    this.projectService.updateProject(project.id, dto).subscribe({
      next: () => {
        this.editProject = null;
        this.loadProject();
        this.showSuccess('project updated successfully.');
      },
      error: () => {
        alert('project not updated check the backend');
      }
    });
  }

  deleteProject(project: ProjectRow): void {
    const confirmed =confirm(` Delete ${project.name}?`);
    if(!confirmed){
      return;
    }
    this.projectService.deleteProject(project.id).subscribe({
      next:()=>{
        this.loadProject();
        this.showSuccess('project deleted successfully.');
      },
      error:()=>{
        console.error('project not deleted')
      }
    });
  }
  addProject(project: CreateProjectDto):
  void{
    this.projectService.createProject(project).subscribe({
      next:()=>{
        this.showCreateForm=false;
        this.clearFilters();
        this.showSuccess('project created successfully');
      },
      error:()=>{
        alert('project is not saved')
      }
    });
  }
  
}
