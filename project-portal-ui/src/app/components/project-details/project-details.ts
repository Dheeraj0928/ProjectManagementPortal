import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LucideFolderKanban, LucideUsers, LucideList, LucidePencil, LucideTrash2, LucideClock, LucideFileText } from '@lucide/angular';
import { Project, ProjectService, ProjectWorkStreamRecord } from '../../services/project';
import { Pagination } from '../pagination/pagination';

interface ProjectTask {
  id: number;
  stream: string;
  release: string;
  phase: string;
  name: string;
  subtask: string;
  employee: string;
  start: string;
  end: string;
  hours: number;
  type: string;
  active: boolean;
}

@Component({
  selector: 'app-project-details',
  imports: [FormsModule, Pagination, LucideFolderKanban, LucideUsers, LucideList, LucidePencil, LucideTrash2, LucideClock, LucideFileText],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css'
})
export class ProjectDetails implements OnChanges, OnDestroy {
  @Input({ required: true }) project!: Project;
  @Output() closed = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  tabs = ['Overview', 'Resource Allocation', 'RAID', 'Metrics Reporting', 'Weekly Report'];
  tab = 'Overview';
  tasks: ProjectTask[] = [];
  workStreams: ProjectWorkStreamRecord[] = [];
  clientContactName = '';
  clientContactEmail = '';
  private databaseTaskIds = new Set<number>();
  page = 1;
  showTaskForm = false;
  task = this.emptyTask();
  error = '';
  loading = false;
  selectedStream = '';
  private request?: Subscription;

  constructor(private service: ProjectService, private changeDetector: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.request?.unsubscribe();
    this.tasks = [];
    this.workStreams = [];
    this.databaseTaskIds.clear();
    this.page = 1;
    this.error = '';
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(window.localStorage.getItem(this.storageKey) ?? '[]');
        if (Array.isArray(saved)) {
          this.tasks = saved.filter(item => item && typeof item.id === 'number' &&
            typeof item.name === 'string' && typeof item.stream === 'string' &&
            typeof item.hours === 'number' && Number.isFinite(item.hours) && typeof item.active === 'boolean')
            .map((item, index) => ({ ...item, id: -(index + 1) }));
        }
      } catch { this.error = 'Saved tasks could not be read from this browser.'; }
    }
    this.loading = true;
    this.request = this.service.getProject(this.project.id).subscribe({
      next: project => {
        this.project = project;
        this.databaseTaskIds = new Set(project.tasks.map(task => task.taskId));
        const databaseTasks: ProjectTask[] = project.tasks.map(task => ({
          id: task.taskId,
          stream: task.workStream,
          release: task.phase,
          phase: task.category,
          name: task.taskName,
          subtask: task.subTasks.join(', '),
          employee: task.employees.join(', '),
          start: task.startDate?.split('T')[0] ?? '',
          end: task.endDate?.split('T')[0] ?? '',
          hours: task.initialPlanHours,
          type: task.taskType,
          active: task.isActive
        }));
        this.tasks = [...databaseTasks, ...this.tasks];
        this.workStreams = project.workStreams;
        const contact = project.clientContacts.find(item => item.contactType === 'ContactPerson');
        this.clientContactName = contact?.contactName ?? '';
        this.clientContactEmail = contact?.contactEmail ?? '';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Latest project details could not be loaded. Showing the list data.';
        this.changeDetector.markForCheck();
      }
    });
  }

  ngOnDestroy(): void { this.request?.unsubscribe(); }
  get storageKey(): string { return `portal-project-${this.project.id}-tasks`; }
  get rows(): ProjectTask[] { return this.tasks.slice((this.page - 1) * 10, this.page * 10); }
  get totalHours(): number { return this.tasks.reduce((total, task) => total + task.hours, 0); }
  get streams(): string[] { return [...new Set([...this.workStreams.map(stream => stream.workStreamName), ...this.tasks.map(task => task.stream || 'General')])]; }
  get currentStream(): string { return this.streams.includes(this.selectedStream) ? this.selectedStream : this.streams[0] ?? ''; }
  get streamTasks(): ProjectTask[] { return this.tasks.filter(task => (task.stream || 'General') === this.currentStream); }
  streamHours(stream: string): number {
    const workStream = this.workStreams.find(item => item.workStreamName === stream);
    return workStream ? workStream.phases.flatMap(phase => phase.efforts).reduce((total, effort) => total + effort.estimatedHours, 0)
      : this.tasks.filter(task => (task.stream || 'General') === stream).reduce((total, task) => total + task.hours, 0);
  }
  get currentPhases() { return this.workStreams.find(item => item.workStreamName === this.currentStream)?.phases ?? []; }
  isDatabaseTask(task: ProjectTask): boolean { return this.databaseTaskIds.has(task.id); }
  date(value?: string | null): string { return value?.split('T')[0] || '—'; }

  emptyTask(): ProjectTask {
    return { id: 0, stream: '', release: '', phase: 'Implementation', name: '', subtask: '', employee: '', start: '', end: '', hours: 0, type: 'Non-Billable', active: true };
  }

  startTask(task?: ProjectTask): void {
    this.task = task ? { ...task } : this.emptyTask();
    this.error = '';
    this.showTaskForm = true;
  }

  saveTasks(tasks: ProjectTask[]): boolean {
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(tasks.filter(task => !this.isDatabaseTask(task))));
      this.tasks = tasks;
      this.page = Math.min(this.page, Math.max(1, Math.ceil(tasks.length / 10)));
      return true;
    } catch {
      this.error = 'Tasks could not be saved. Browser storage may be unavailable or full.';
      return false;
    }
  }

  saveTask(): void {
    if (!this.task.name.trim() || !this.task.employee.trim()) {
      this.error = 'Task name and employee are required.';
      return;
    }
    if (this.task.hours === null || !Number.isFinite(this.task.hours) || this.task.hours < 0) {
      this.error = 'Task hours must be zero or more.';
      return;
    }
    if (this.task.start && this.task.end && this.task.end < this.task.start) {
      this.error = 'Task end date must be on or after its start date.';
      return;
    }
    const task = { ...this.task, name: this.task.name.trim(), employee: this.task.employee.trim(), stream: this.task.stream.trim() || 'General' };
    const editing = task.id !== 0;
    if (!editing) { task.id = Math.min(0, ...this.tasks.map(item => item.id)) - 1; }
    const tasks = editing ? this.tasks.map(item => item.id === task.id ? task : item) : [...this.tasks, task];
    if (this.saveTasks(tasks)) {
      this.showTaskForm = false;
      this.error = '';
      if (!editing) { this.page = Math.ceil(tasks.length / 10); }
    }
  }

  deleteTask(task: ProjectTask): void {
    if (confirm(`Delete task "${task.name}"?`)) { this.saveTasks(this.tasks.filter(item => item.id !== task.id)); }
  }

  toggleTask(task: ProjectTask): void {
    this.saveTasks(this.tasks.map(item => item.id === task.id ? { ...item, active: !item.active } : item));
  }
}
