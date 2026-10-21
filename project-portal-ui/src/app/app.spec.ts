import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProjectForm } from './components/project-form/project-form';
import { Pagination } from './components/pagination/pagination';
import { of, Subject, throwError } from 'rxjs';
import { App } from './app';
import { CreateProjectDto, Project, ProjectPage, ProjectService } from './services/project';

// Simulate 23 projects without modifying real database records.
function makePage(pageNumber = 1, pageSize = 10, totalCount = 23): ProjectPage {
  const count = Math.max(0, Math.min(pageSize, totalCount - (pageNumber - 1) * pageSize));
  return {
    items: Array.from({ length: count }, (_, index) => ({
      id: (pageNumber - 1) * pageSize + index + 1,
      code: `PRJ-${(pageNumber - 1) * pageSize + index + 1}`,
      customer: 'Test Customer',
      name: 'Test Project',
      estimatedHours: 10,
      onshoreManager: '',
      offshoreManager: '',
      status: 'In Progress'
    })),
    pageNumber,
    pageSize,
    totalCount,
    totalProjects: 23,
    statusCounts: { 'In Progress': 20, Completed: 3 }
  };
}

describe('App pagination', () => {
  let app: App;
  let service: {
    getProjects: ReturnType<typeof vi.fn>;
    createProject: ReturnType<typeof vi.fn>;
    updateProject: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getProjects: vi.fn((page = 1, size = 10) => of(makePage(page, size))),
      createProject: vi.fn(),
      updateProject: vi.fn()
    };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: ProjectService, useValue: service }]
    }).compileComponents();
    app = TestBed.createComponent(App).componentInstance;
    app.ngOnInit();
  });

  afterEach(() => app.ngOnDestroy());

  it('loads one page and uses full-list counts for status tabs', () => {
    expect(app.projects.length).toBe(10);
    expect(app.totalPages).toBe(3);

    expect(app.getStatusCount('All')).toBe(23);
    expect(app.getStatusCount('Completed')).toBe(3);
  });

  it('keeps dates, missing values and zero hours intact when mapping API records', () => {
    const page = makePage();
    page.items[0] = {
      ...page.items[0],
      startDate: '2026-10-16T03:45:00Z',
      endDate: 'invalid-date',
      revisedEndDate: null,
      actualHours: 0,
      estimatedHours: 0
    };
    service.getProjects.mockReturnValueOnce(of(page));
    app.loadProjects();
    expect(app.projects[0]).toMatchObject({
      startDate: '2026-10-16',
      endDate: '',
      revisedEndDate: '',
      renewalDate: '',
      issueDate: '',
      estimatedHours: 0,
      actualHours: 0
    });
  });

  it('requests subsequent pages and handles a partial final page', () => {
    app.changePage(2);
    expect(service.getProjects).toHaveBeenLastCalledWith(2, 10, '', 'all', 'All');

    app.changePage(3);
    expect(app.projects.length).toBe(3);

    const calls = service.getProjects.mock.calls.length;
    app.changePage(4);
    app.changePage(0);
    expect(service.getProjects.mock.calls.length).toBe(calls);
  });

  it('resets to page one when search, status or page size changes', () => {
    app.currentPage = 3;
    app.searchText = 'TCS';
    app.selectedColumn = 'customer';
    app.pageSize = 25;
    app.selectStatus('Completed');
    expect(service.getProjects).toHaveBeenLastCalledWith(1, 25, 'TCS', 'customer', 'Completed');
    app.clearFilters();
    expect(service.getProjects).toHaveBeenLastCalledWith(1, 25, '', 'all', 'All');
  });

  it('blocks navigation for an empty result', () => {
    service.getProjects.mockReturnValue(of(makePage(1, 10, 0)));
    app.applyFilters();

    expect(app.totalPages).toBe(1);
    const calls = service.getProjects.mock.calls.length;
    app.changePage(2);
    expect(service.getProjects.mock.calls.length).toBe(calls);
  });

  it('accepts the corrected page returned after deletion on the last page', () => {
    app.currentPage = 3;
    service.getProjects.mockReturnValue(of(makePage(2, 10, 20)));
    app.loadProjects();
    expect(app.currentPage).toBe(2);
    expect(app.totalPages).toBe(2);
  });

  it('cancels an older request when the user changes filters again', () => {
    const oldResponse = new Subject<ProjectPage>();
    const latestResponse = new Subject<ProjectPage>();
    service.getProjects.mockReturnValueOnce(oldResponse).mockReturnValueOnce(latestResponse);
    app.applyFilters();
    app.searchText = 'latest';
    app.applyFilters();
    latestResponse.next(makePage(1, 10, 1));
    oldResponse.next(makePage());
    expect(app.totalCount).toBe(1);
    expect(app.loading).toBe(false);
  });

  it('clears old rows on failure and can retry successfully', () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.getProjects.mockReturnValueOnce(throwError(() => new Error('Network failed')));
    app.loadProjects();
    expect(app.projects).toEqual([]);
    expect(app.errorMessage).not.toBe('');
    expect(app.loading).toBe(false);
    app.loadProjects();
    expect(app.projects.length).toBe(10);
    expect(app.errorMessage).toBe('');
    errorLog.mockRestore();
  });
  it('saves wizard data once and returns to the unfiltered first page', () => {
    const dto: CreateProjectDto = {
      code: 'TCS-CP-201',
      customer: 'TCS',
      name: 'Customer Portal',
      estimatedHours: 120,
      actualHours: 0,
      status: 'In Progress',
      onshoreManager: 'Amit',
      offshoreManager: 'Priya',
      revisedEndDate: '2027-02-15',
      renewalDate: '2027-03-01'
    };
    const response = new Subject<Project>();
    service.createProject.mockReturnValue(response);
    app.showCreateForm = true;
    app.currentPage = 3;
    app.searchText = 'Other';
    app.filterStatus = 'Completed';
    app.addProject(dto);
    app.addProject(dto);
    app.closeCreateForm();
    expect(service.createProject).toHaveBeenCalledExactlyOnceWith(dto);
    expect(app.savingProject).toBe(true);
    expect(app.showCreateForm).toBe(true);
    response.next({ ...dto, id: 99 });
    expect(app.savingProject).toBe(false);
    expect(app.showCreateForm).toBe(false);
    expect(app.searchText).toBe('');
    expect(app.filterStatus).toBe('All');
    expect(service.getProjects).toHaveBeenLastCalledWith(1, 10, '', 'all', 'All');
  });

  it('keeps the wizard open on API failure and permits retry', () => {
    const dto: CreateProjectDto = {
      code: 'TCS-CP-201',
      customer: 'TCS',
      name: 'Customer Portal',
      estimatedHours: 120,
      status: 'In Progress',
      onshoreManager: '',
      offshoreManager: ''
    };
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.createProject.mockReturnValueOnce(throwError(() => new Error('Offline')));
    app.showCreateForm = true;
    app.addProject(dto);
    expect(app.showCreateForm).toBe(true);
    expect(app.savingProject).toBe(false);
    expect(app.createError).toContain('Your details are still here');
    service.createProject.mockReturnValueOnce(of({ ...dto, id: 99 }));
    app.addProject(dto);
    expect(app.showCreateForm).toBe(false);
    expect(app.createError).toBe('');
    errorLog.mockRestore();
  });
  it('connects reusable pagination events to page and page-size requests', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const pager = fixture.debugElement.query(By.directive(Pagination))
      .componentInstance as Pagination;
    expect(pager.itemLabel).toBe('projects');
    pager.pageChange.emit(2);
    await fixture.whenStable();
    expect(service.getProjects).toHaveBeenLastCalledWith(2, 10, '', 'all', 'All');
    pager.pageSizeChange.emit(25);
    await fixture.whenStable();
    expect(service.getProjects).toHaveBeenLastCalledWith(1, 25, '', 'all', 'All');
  });

  it('uses the shared form to edit without mutating the row and sends a PUT', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const parent = fixture.componentInstance;
    const row = parent.projects[0];
    row.actualHours = 0;
    row.revisedEndDate = '2027-02-15';
    row.renewalDate = '2027-03-01';
    (fixture.nativeElement.querySelector('.edit-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    const child = fixture.debugElement.query(By.directive(ProjectForm))
      .componentInstance as ProjectForm;
    expect(child.mode).toBe('edit');
    expect(child.formData.renewalDate).toBe('2027-03-01');
    child.formData.name = 'Updated Portal';
    child.currentStep = 4;
    expect(row.name).toBe('Test Project');
    const result = new Subject<void>();
    service.updateProject.mockReturnValue(result);
    child.submitForm();
    parent.saveEdit({ ...row, name: 'Duplicate click' });
    parent.cancelEdit();
    expect(service.updateProject).toHaveBeenCalledTimes(1);
    expect(service.updateProject).toHaveBeenLastCalledWith(
      row.id,
      expect.objectContaining({
        name: 'Updated Portal',
        actualHours: 0,
        revisedEndDate: '2027-02-15',
        renewalDate: '2027-03-01'
      })
    );
    expect(service.createProject).not.toHaveBeenCalled();
    expect(parent.editProject).not.toBeNull();
    result.next();
    await fixture.whenStable();
    expect(parent.editProject).toBeNull();
    expect(parent.savingProject).toBe(false);
  });

  it('preserves the edit draft and review step after API failure, then permits retry', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const parent = fixture.componentInstance;
    (fixture.nativeElement.querySelector('.edit-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    const child = fixture.debugElement.query(By.directive(ProjectForm))
      .componentInstance as ProjectForm;
    child.formData.name = 'Unsaved Portal';
    child.currentStep = 4;
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.updateProject.mockReturnValueOnce(throwError(() => new Error('Offline')));
    child.submitForm();
    await fixture.whenStable();
    expect(child.formData.name).toBe('Unsaved Portal');
    expect(child.currentStep).toBe(4);
    expect(parent.editError).toContain('Your changes are still here');
    expect(parent.projects[0].name).toBe('Test Project');
    service.updateProject.mockReturnValueOnce(of(undefined));
    child.submitForm();
    await fixture.whenStable();
    expect(parent.editProject).toBeNull();
    errorLog.mockRestore();
  });

  it('cancels editing and reopens with the original row data', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const parent = fixture.componentInstance;
    const row = parent.projects[0];
    (fixture.nativeElement.querySelector('.edit-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    let child = fixture.debugElement.query(By.directive(ProjectForm))
      .componentInstance as ProjectForm;
    child.formData.name = 'Discard this';
    child.cancelled.emit();
    await fixture.whenStable();
    expect(parent.editProject).toBeNull();
    expect(row.name).toBe('Test Project');
    (fixture.nativeElement.querySelector('.edit-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    child = fixture.debugElement.query(By.directive(ProjectForm)).componentInstance as ProjectForm;
    expect(child.formData.name).toBe('Test Project');
    expect(child.currentStep).toBe(1);
    expect(service.updateProject).not.toHaveBeenCalled();
  });
});
