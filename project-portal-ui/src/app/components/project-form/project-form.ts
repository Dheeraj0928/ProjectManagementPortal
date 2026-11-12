import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import{EventEmitter,Output} from '@angular/core'
import { CreateProjectDto } from '../../services/project';
@Component({
  imports: [FormsModule],
  selector: 'app-project-form',
  styleUrl: './project-form.css',
  templateUrl: './project-form.html',
})
export class ProjectForm {

  currentStep=1;
  readonly totalSteps=4;
  validationMessage='';


formData={
  code:'',
  customer:'',
  name:'',
  status:'In Progress',
  startDate:'',
  endDate:'',
  revisedEndDate:'',
  renewalDate:'',
  issueDate:'',
  estimatedHours:0,
  actualHours: null as number | null,
  onshoreManager:'',
  offshoreManager:''
};

@Output() submitted = new EventEmitter<CreateProjectDto>();

submitForm(): void {
  for (const step of [1, 2, 3]) {
    if (!this.validateStep(step)) {
      this.currentStep = step;
      return;
    }
  }

  this.submitted.emit({
    ...this.formData,
    startDate: this.formData.startDate || null,
    endDate: this.formData.endDate || null,
    revisedEndDate: this.formData.revisedEndDate || null,
    renewalDate: this.formData.renewalDate || null,
    issueDate: this.formData.issueDate || null
  });
}


nextStep():void{
  if(this.currentStep < this.totalSteps && this.validateStep(this.currentStep)){
    this.currentStep++;
  }
}
previousStep(): void{
  if(this.currentStep>1){
    this.validationMessage='';
    this.currentStep--;
  }
}

private validateStep(step: number): boolean {
  this.validationMessage = '';

  if (step === 1 && (!this.formData.code.trim() || !this.formData.customer.trim() || !this.formData.name.trim())) {
    this.validationMessage = 'Project code, customer name aur project name bharo.';
  } else if (step === 2 && this.formData.startDate && this.formData.endDate && this.formData.endDate < this.formData.startDate) {
    this.validationMessage = 'End date start date se pehle nahi ho sakti.';
  } else if (step === 3) {
    if (!this.formData.onshoreManager.trim() || !this.formData.offshoreManager.trim()) {
      this.validationMessage = 'Dono manager names bharo.';
    } else if (!Number.isFinite(this.formData.estimatedHours) || this.formData.estimatedHours < 0 ||
      (this.formData.actualHours !== null && (!Number.isFinite(this.formData.actualHours) || this.formData.actualHours < 0))) {
      this.validationMessage = 'Hours zero ya positive number hone chahiye.';
    }
  }

  return !this.validationMessage;
}

}
