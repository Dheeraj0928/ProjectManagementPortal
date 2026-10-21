import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateProjectDto } from '../../services/project';

interface ProjectFormData {
  code: string;
  customer: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  revisedEndDate: string;
  renewalDate: string;
  issueDate: string;
  estimatedHours: number | null;
  actualHours: number | null;
  onshoreManager: string;
  offshoreManager: string;
}

@Component({
  imports: [FormsModule],
  selector: 'app-project-form',
  styleUrl: './project-form.css',
  templateUrl: './project-form.html'
})
export class ProjectForm implements OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialProject: CreateProjectDto | null = null;
  @Input() saving = false;
  @Input() saveError = '';
  @Output() submitted = new EventEmitter<CreateProjectDto>();
  @Output() cancelled = new EventEmitter<void>();

  currentStep = 1;
  readonly totalSteps = 4;
  readonly stepLabels = ['Basic Details', 'Project Dates', 'Hours & Managers', 'Review'];
  validationMessage = '';

  // Copy input values so editing never changes the table row before save.
  formData: ProjectFormData = this.createFormData(null);

  ngOnChanges(changes: SimpleChanges): void {
    // Save/error input changes must keep the user's current draft and step.
    if (changes['initialProject']) {
      this.formData = this.createFormData(this.initialProject);
      this.currentStep = 1;
      this.validationMessage = '';
    }
  }

  private createFormData(project: CreateProjectDto | null): ProjectFormData {
    return {
      code: project?.code ?? '',
      customer: project?.customer ?? '',
      name: project?.name ?? '',
      status: project?.status ?? 'In Progress',
      startDate: (project?.startDate ?? '').split('T')[0],
      endDate: (project?.endDate ?? '').split('T')[0],
      revisedEndDate: (project?.revisedEndDate ?? '').split('T')[0],
      renewalDate: (project?.renewalDate ?? '').split('T')[0],
      issueDate: (project?.issueDate ?? '').split('T')[0],
      estimatedHours: project?.estimatedHours ?? 0,
      actualHours: project?.actualHours ?? null,
      onshoreManager: project?.onshoreManager ?? '',
      offshoreManager: project?.offshoreManager ?? ''
    };
  }

  get submitButtonText(): string {
    if (this.saving) {
      return 'Saving...';
    }
    if (this.mode === 'edit') {
      return 'Update Project';
    }
    return 'Save Project';
  }

  nextStep(): void {
    if (this.saving || this.currentStep >= this.totalSteps) {
      return;
    }
    this.validationMessage = this.getStepError(this.currentStep);
    if (this.validationMessage) {
      return;
    }
    this.currentStep++;
  }

  previousStep(): void {
    if (this.saving || this.currentStep <= 1) {
      return;
    }
    this.validationMessage = '';
    this.currentStep--;
  }

  getStepError(step: number): string {
    if (step === 1) {
      if (!this.formData.code.trim()) {
        return 'Enter a project code.';
      }
      if (!this.formData.customer.trim()) {
        return 'Enter a customer name.';
      }
      if (!this.formData.name.trim()) {
        return 'Enter a project name.';
      }
    }
    if (step === 3) {
      const estimated = this.formData.estimatedHours;
      const actual = this.formData.actualHours;
      if (estimated === null || !Number.isFinite(estimated) || estimated < 0) {
        return 'Estimated hours must be zero or a positive number.';
      }
      if (actual !== null && (!Number.isFinite(actual) || actual < 0)) {
        return 'Actual hours must be zero or a positive number, or left blank.';
      }
    }
    return '';
  }

  submitForm(): void {
    if (this.saving) {
      return;
    }
    // Enter on an earlier step advances without saving.
    if (this.currentStep < this.totalSteps) {
      this.nextStep();
      return;
    }
    // Recheck every step before the final save.
    for (let step = 1; step < this.totalSteps; step++) {
      this.validationMessage = this.getStepError(step);
      if (this.validationMessage) {
        this.currentStep = step;
        return;
      }
    }
    const projectDetails: CreateProjectDto = {
      code: this.formData.code.trim(),
      customer: this.formData.customer.trim(),
      name: this.formData.name.trim(),
      status: this.formData.status,
      startDate: this.formData.startDate || null,
      endDate: this.formData.endDate || null,
      revisedEndDate: this.formData.revisedEndDate || null,
      renewalDate: this.formData.renewalDate || null,
      issueDate: this.formData.issueDate || null,
      estimatedHours: this.formData.estimatedHours ?? 0,
      actualHours: this.formData.actualHours,
      onshoreManager: this.formData.onshoreManager.trim(),
      offshoreManager: this.formData.offshoreManager.trim()
    };

    this.submitted.emit(projectDetails);
  }
}
