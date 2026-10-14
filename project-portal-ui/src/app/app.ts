import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService, Project } from './services/project';

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
  isEditing?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showFilters = false;
  showCreateForm = false;
  searchText = '';
  selectedColumn = 'all';
  filterStatus = 'All';
  loading = false;
  errorMessage = '';
  successMessage = '';

  newProject = {
    code: '',
    customer: '',
    name: '',
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    onshoreManager: '',
    offshoreManager: '',
    status: 'In Progress'
  };

  projects: ProjectRow[] = [];

  // Edit state
  editProject: ProjectRow | null = null;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data.map(project => ({
          id: project.id,
          code: project.code ?? '',
          customer: project.customer ?? '',
          name: project.name ?? '',
          startDate: project.startDate ? this.formatDateForDisplay(project.startDate) : '',
          endDate: project.endDate ? this.formatDateForDisplay(project.endDate) : '',
          revisedEndDate: project.revisedEndDate ? this.formatDateForDisplay(project.revisedEndDate) : '',
          renewalDate: project.renewalDate ? this.formatDateForDisplay(project.renewalDate) : '',
          issueDate: project.issueDate ? this.formatDateForDisplay(project.issueDate) : '',
          estimatedHours: project.estimatedHours ?? 0,
          actualHours: project.actualHours ?? null,
          onshoreManager: project.onshoreManager ?? '',
          offshoreManager: project.offshoreManager ?? '',
          status: project.status ?? 'Draft'
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Projects load failed:', error);
        this.errorMessage = 'Projects load nahi hue. Backend API check karo.';
        this.loading = false;
      }
    });
  }

  formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  get filteredProjects(): ProjectRow[] {
    const query = this.searchText.trim().toLowerCase();

    return this.projects.filter(project => {
      const values = [
        project.code,
        project.customer,
        project.name
      ];

      const matchesSearch = !query ||
        (this.selectedColumn === 'all'
          ? values.some(value => (value ?? '').toLowerCase().includes(query))
          : String((project as any)[this.selectedColumn] ?? '')
              .toLowerCase().includes(query));

      const matchesStatus =
        this.filterStatus === 'All' ||
        project.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  getStatusCount(status: string): number {
    if (status === 'All') return this.projects.length;
    return this.projects.filter(p => p.status === status).length;
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  addProject(): void {
    if (
      !this.newProject.code.trim() ||
      !this.newProject.customer.trim() ||
      !this.newProject.name.trim()
    ) {
      alert('Project Code, Customer aur Project Name bharna zaroori hai.');
      return;
    }

    const project: any = {
      code: this.newProject.code.trim(),
      customer: this.newProject.customer.trim(),
      name: this.newProject.name.trim(),
      startDate: this.newProject.startDate || null,
      endDate: this.newProject.endDate || null,
      estimatedHours: this.newProject.estimatedHours || 0,
      onshoreManager: this.newProject.onshoreManager.trim(),
      offshoreManager: this.newProject.offshoreManager.trim(),
      status: this.newProject.status || 'In Progress'
    };

    this.projectService.createProject(project).subscribe({
      next: () => {
        this.newProject = {
          code: '',
          customer: '',
          name: '',
          startDate: '',
          endDate: '',
          estimatedHours: 0,
          onshoreManager: '',
          offshoreManager: '',
          status: 'In Progress'
        };
        this.showCreateForm = false;
        this.loadProjects();
        this.showSuccess('✅ Project successfully create ho gaya!');
      },
      error: (error) => {
        console.error('Project create failed:', error);
        alert('Project save nahi hua. Backend terminal check karo.');
      }
    });
  }

  startEdit(project: ProjectRow): void {
    this.editProject = { ...project };
  }

  cancelEdit(): void {
    this.editProject = null;
  }

  saveEdit(): void {
    if (!this.editProject) return;

    if (
      !this.editProject.code.trim() ||
      !this.editProject.customer.trim() ||
      !this.editProject.name.trim()
    ) {
      alert('Project Code, Customer aur Project Name zaroori hai.');
      return;
    }

    const dto: any = {
      code: this.editProject.code.trim(),
      customer: this.editProject.customer.trim(),
      name: this.editProject.name.trim(),
      startDate: this.editProject.startDate || null,
      endDate: this.editProject.endDate || null,
      revisedEndDate: this.editProject.revisedEndDate || null,
      renewalDate: this.editProject.renewalDate || null,
      issueDate: this.editProject.issueDate || null,
      estimatedHours: this.editProject.estimatedHours || 0,
      actualHours: this.editProject.actualHours,
      onshoreManager: this.editProject.onshoreManager?.trim() ?? '',
      offshoreManager: this.editProject.offshoreManager?.trim() ?? '',
      status: this.editProject.status || 'In Progress'
    };

    this.projectService.updateProject(this.editProject.id, dto).subscribe({
      next: () => {
        this.editProject = null;
        this.loadProjects();
        this.showSuccess('✅ Project successfully update ho gaya!');
      },
      error: (error) => {
        console.error('Update failed:', error);
        alert('Project update nahi hua. Check backend.');
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