import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProjectForm } from './components/project-form/project-form';
import { Pagination } from './components/pagination/pagination';
import {
  LucideFolderKanban,
  LucideUsers,
  LucideChartNoAxesCombined,
  LucideContactRound,
  LucideShieldCheck,
  LucideCalendarClock,
  LucideChevronDown,
  LucideList,
  LucideSlidersHorizontal,
  LucidePlus,
  LucideX,
  LucidePencil,
  LucideTrash2,
  LucideSearch,
  LucideRotateCcw,
  LucideCircleCheck,
  LucideCircleAlert
} from '@lucide/angular';
import { ProjectService, CreateProjectDto, Project } from './services/project';

interface ProjectRow {
  id: number;
  code: string;
  customer: string;
  name: string;
  startDate: string;
  endDate: string;
  revisedEndDate: string;
  renewalDate: string;
  issueDate: string;
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
    ProjectForm,
    Pagination,
    FormsModule,
    LucideFolderKanban,
    LucideUsers,
    LucideChartNoAxesCombined,
    LucideContactRound,
    LucideShieldCheck,
    LucideCalendarClock,
    LucideChevronDown,
    LucideList,
    LucideSlidersHorizontal,
    LucidePlus,
    LucideX,
    LucidePencil,
    LucideTrash2,
    LucideSearch,
    LucideRotateCcw,
    LucideCircleCheck,
    LucideCircleAlert
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  showFilters = false;
  showCreateForm = false;
  searchText = '';
  selectedColumn = 'all';
  filterStatus = 'All';
  loading = false;
  errorMessage = '';
  successMessage = '';
  savingProject = false;
  createError = '';
  editError = '';

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalProjects = 0;
  statusCounts: Record<string, number> = {};
  private projectsRequest?: Subscription;

  projects: ProjectRow[] = [];

  // Edit state
  editProject: ProjectRow | null = null;

  constructor(
    private projectService: ProjectService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.projectsRequest?.unsubscribe();
  }

  loadProjects(): void {
    // Cancel an older request so fast searches cannot display outdated results.
    this.projectsRequest?.unsubscribe();
    this.loading = true;
    this.errorMessage = '';
    this.projects = [];

    this.projectsRequest = this.projectService
      .getProjects(
        this.currentPage,
        this.pageSize,
        this.searchText,
        this.selectedColumn,
        this.filterStatus
      )
      .subscribe({
        next: (data) => {
          this.currentPage = data.pageNumber;
          this.pageSize = data.pageSize;
          this.totalCount = data.totalCount;
          this.totalProjects = data.totalProjects;
          this.statusCounts = data.statusCounts;
          this.projects = data.items.map((project) => this.toProjectRow(project));
          this.loading = false;
          this.changeDetector.markForCheck();
        },
        error: (error) => {
          this.totalCount = 0;
          this.currentPage = 1;
          console.error('Projects load failed:', error);
          this.errorMessage = 'Projects load nahi hue. Backend API check karo.';
          this.loading = false;
          this.changeDetector.markForCheck();
        }
      });
  }

  private toProjectRow(project: Project): ProjectRow {
    return {
      id: project.id,
      code: project.code ?? '',
      customer: project.customer ?? '',
      name: project.name ?? '',
      startDate: this.formatDateForDisplay(project.startDate),
      endDate: this.formatDateForDisplay(project.endDate),
      revisedEndDate: this.formatDateForDisplay(project.revisedEndDate),
      renewalDate: this.formatDateForDisplay(project.renewalDate),
      issueDate: this.formatDateForDisplay(project.issueDate),
      estimatedHours: project.estimatedHours ?? 0,
      actualHours: project.actualHours ?? null,
      onshoreManager: project.onshoreManager ?? '',
      offshoreManager: project.offshoreManager ?? '',
      status: project.status ?? 'Draft'
    };
  }

  formatDateForDisplay(dateValue?: string | null): string {
    if (!dateValue) {
      return '';
    }
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  changePage(page: number): void {
    if (this.loading || page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadProjects();
  }

  changePageSize(size: number): void {
    if (this.loading) {
      return;
    }
    this.pageSize = size;
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProjects();
  }

  selectStatus(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedColumn = 'all';
    this.filterStatus = 'All';
    this.applyFilters();
  }

  getStatusCount(status: string): number {
    if (status === 'All') {
      return this.totalProjects;
    }
    return this.statusCounts[status] ?? 0;
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
      this.changeDetector.markForCheck();
    }, 3000);
  }

  toggleCreateForm(): void {
    if (this.savingProject) {
      return;
    }
    this.createError = '';
    this.showCreateForm = !this.showCreateForm;
  }

  closeCreateForm(): void {
    if (this.savingProject) {
      return;
    }
    this.showCreateForm = false;
    this.createError = '';
  }

  addProject(projectDetails: CreateProjectDto): void {
    if (this.savingProject) {
      return;
    }
    this.savingProject = true;
    this.createError = '';

    this.projectService.createProject(projectDetails).subscribe({
      next: () => {
        this.savingProject = false;
        this.showCreateForm = false;
        // Reset filters so the new project appears on page one.
        this.clearFilters();
        this.showSuccess('Project successfully created!');
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.savingProject = false;
        console.error('Project create failed:', error);
        this.createError =
          'Project could not be saved. Your details are still here. Please try again.';
        this.changeDetector.markForCheck();
      }
    });
  }

  startEdit(project: ProjectRow): void {
    if (this.savingProject) {
      return;
    }
    this.editError = '';
    this.editProject = { ...project };
  }

  cancelEdit(): void {
    if (this.savingProject) {
      return;
    }
    this.editProject = null;
    this.editError = '';
  }

  saveEdit(projectDetails: CreateProjectDto): void {
    if (!this.editProject || this.savingProject) {
      return;
    }
    this.savingProject = true;
    this.editError = '';

    // The shared form returns the same DTO for Create and Edit.
    this.projectService.updateProject(this.editProject.id, projectDetails).subscribe({
      next: () => {
        this.savingProject = false;
        this.editProject = null;
        this.loadProjects();
        this.showSuccess('Project successfully updated!');
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.savingProject = false;
        console.error('Project update failed:', error);
        this.editError =
          'Project could not be updated. Your changes are still here. Please try again.';
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteProject(project: ProjectRow): void {
    if (!confirm(`Kya aap "${project.name}" ko delete karna chahte ho?`)) {
      return;
    }

    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.loadProjects();
        this.showSuccess('🗑️ Project successfully delete ho gaya!');
      },
      error: (error) => {
        console.error('Delete failed:', error);
        alert('Project delete nahi hua. Check backend.');
      }
    });
  }
}
