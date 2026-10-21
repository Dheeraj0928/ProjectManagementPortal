import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectDto } from '../../services/project';
import { ProjectForm } from './project-form';

describe('ProjectForm multi-step creation', () => {
  let component: ProjectForm;
  let fixture: ComponentFixture<ProjectForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProjectForm] }).compileComponents();
    fixture = TestBed.createComponent(ProjectForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function fillBasicDetails(): void {
    component.formData.code = ' TCS-CP-201 ';
    component.formData.customer = ' TCS ';
    component.formData.name = ' Customer Portal ';
  }

  it('blocks blank or whitespace-only required fields', () => {
    component.formData.code = '   ';
    component.nextStep();
    expect(component.currentStep).toBe(1);
    expect(component.validationMessage).toContain('project code');
    component.formData.code = 'TCS-CP-201';
    component.nextStep();
    expect(component.validationMessage).toContain('customer');
  });

  it('keeps values across Next and Back and shows all details on Review', async () => {
    async function enter(id: string, value: string): Promise<void> {
      const input = fixture.nativeElement.querySelector('#' + id) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    }
    async function click(label: string): Promise<void> {
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('button')
      ) as HTMLButtonElement[];
      buttons.find((button) => button.textContent?.trim() === label)!.click();
      await fixture.whenStable();
    }
    await enter('create-code', 'TCS-CP-201');
    await enter('create-customer', 'TCS');
    await enter('create-name', 'Customer Portal');
    await click('Next');
    await enter('create-startDate', '2026-10-16');
    await enter('create-revisedEndDate', '2027-02-15');
    await enter('create-renewalDate', '2027-03-01');
    await click('Next');
    await enter('create-onshoreManager', 'Amit Sharma');
    await enter('create-estimatedHours', '120');
    await click('Back');
    const startDate = fixture.nativeElement.querySelector('#create-startDate') as HTMLInputElement;
    expect(startDate.value).toBe('2026-10-16');
    await click('Next');
    const manager = fixture.nativeElement.querySelector(
      '#create-onshoreManager'
    ) as HTMLInputElement;
    expect(manager.value).toBe('Amit Sharma');
    await click('Next');
    const text = fixture.nativeElement.textContent;
    expect(component.currentStep).toBe(4);
    expect(text).toContain('Customer Portal');
    expect(text).toContain('2027-02-15');
    expect(text).toContain('2027-03-01');
    expect(text).toContain('Amit Sharma');
    expect(text).toContain('Save Project');
  });

  it('validates hours before allowing review', () => {
    component.currentStep = 3;
    component.formData.estimatedHours = null;
    component.nextStep();
    expect(component.currentStep).toBe(3);
    component.formData.estimatedHours = 120;
    component.formData.actualHours = -1;
    component.nextStep();
    expect(component.currentStep).toBe(3);
    expect(component.validationMessage).toContain('Actual hours');
    component.formData.actualHours = null;
    component.nextStep();
    expect(component.currentStep).toBe(4);
  });

  it('emits trimmed details, all dates and preserves zero actual hours', () => {
    fillBasicDetails();
    component.currentStep = 4;
    component.formData.revisedEndDate = '2027-02-15';
    component.formData.renewalDate = '2027-03-01';
    component.formData.actualHours = 0;
    let payload: CreateProjectDto | undefined;
    component.submitted.subscribe((value) => (payload = value));
    component.submitForm();
    expect(payload).toEqual({
      code: 'TCS-CP-201',
      customer: 'TCS',
      name: 'Customer Portal',
      status: 'In Progress',
      startDate: null,
      endDate: null,
      issueDate: null,
      revisedEndDate: '2027-02-15',
      renewalDate: '2027-03-01',
      estimatedHours: 0,
      actualHours: 0,
      onshoreManager: '',
      offshoreManager: ''
    });
    expect(component.formData.startDate).toBe('');
  });

  it('does not save on Enter before Review and revalidates at final submit', () => {
    fillBasicDetails();
    const emit = vi.spyOn(component.submitted, 'emit');
    component.submitForm();
    expect(component.currentStep).toBe(2);
    expect(emit).not.toHaveBeenCalled();
    component.currentStep = 4;
    component.formData.name = '';
    component.submitForm();
    expect(component.currentStep).toBe(1);
    expect(emit).not.toHaveBeenCalled();
  });

  it('disables navigation and submission while a save is pending', () => {
    fillBasicDetails();
    component.currentStep = 4;
    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();
    const emit = vi.spyOn(component.submitted, 'emit');
    component.submitForm();
    component.previousStep();
    expect(component.currentStep).toBe(4);
    expect(emit).not.toHaveBeenCalled();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('emits cancel without submitting project data', () => {
    const cancel = vi.spyOn(component.cancelled, 'emit');
    const submit = vi.spyOn(component.submitted, 'emit');
    const button = fixture.nativeElement.querySelector('.form-actions button') as HTMLButtonElement;
    button.click();
    expect(cancel).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });
  it('prefills an independent edit draft, formats dates and resets for another project', async () => {
    const original: CreateProjectDto = {
      code: 'TCS-CP-201',
      customer: 'TCS',
      name: 'Existing Portal',
      status: 'Active',
      estimatedHours: 120,
      actualHours: 0,
      onshoreManager: 'Amit',
      offshoreManager: 'Priya',
      startDate: '2026-10-16T00:00:00',
      endDate: null,
      revisedEndDate: '2027-02-15T00:00:00',
      renewalDate: '2027-03-01T00:00:00'
    };
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialProject', original);
    await fixture.whenStable();
    expect(component.formData.startDate).toBe('2026-10-16');
    expect(component.formData.endDate).toBe('');
    expect(component.formData.actualHours).toBe(0);
    const nameInput = fixture.nativeElement.querySelector('#edit-name') as HTMLInputElement;
    expect(nameInput.value).toBe('Existing Portal');
    component.formData.name = 'Unsaved name';
    component.currentStep = 4;
    fixture.componentRef.setInput('saveError', 'Try again');
    await fixture.whenStable();
    expect(component.formData.name).toBe('Unsaved name');
    expect(component.currentStep).toBe(4);
    expect(fixture.nativeElement.textContent).toContain('Update Project');
    expect(original.name).toBe('Existing Portal');
    fixture.componentRef.setInput('initialProject', {
      ...original,
      code: 'WIP-HR-202',
      name: 'HR Portal'
    });
    await fixture.whenStable();
    expect(component.currentStep).toBe(1);
    expect(component.formData.name).toBe('HR Portal');
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('initialProject', null);
    await fixture.whenStable();
    expect(component.formData.code).toBe('');
    expect(component.formData.status).toBe('In Progress');
  });
});
