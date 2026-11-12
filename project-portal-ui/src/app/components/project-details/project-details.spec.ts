import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Project, ProjectService } from '../../services/project';
import { ProjectDetails } from './project-details';

const project: Project = { id: 1, code: 'TCS-101', customer: 'TCS', name: 'Portal', estimatedHours: 100, onshoreManager: 'Amit', offshoreManager: 'Priya', status: 'In Progress' };

function createPage(id = 1) {
  const data = { ...project, id };
  const service = { getProject: vi.fn(() => of(data)) };
  const page = new ProjectDetails(service as unknown as ProjectService, { markForCheck: vi.fn() } as unknown as ChangeDetectorRef);
  page.project = data;
  page.ngOnChanges();
  return { page, service };
}

describe('Project Details', () => {
  beforeEach(() => localStorage.clear());

  it('loads the selected project and isolates browser tasks by project ID', () => {
    const { page, service } = createPage();
    expect(service.getProject).toHaveBeenCalledWith(1);
    page.task = { ...page.emptyTask(), name: 'Testing', employee: 'Neha', stream: 'Portal', hours: 12 };
    page.saveTask();
    expect(createPage(1).page.tasks.length).toBe(1);
    expect(createPage(2).page.tasks.length).toBe(0);
  });

  it('updates an existing task without duplication and recalculates efforts', () => {
    const { page } = createPage();
    page.task = { ...page.emptyTask(), name: 'Development', employee: 'Amit', hours: 10 };
    page.saveTask();
    page.startTask(page.tasks[0]);
    page.task.hours = 25;
    page.saveTask();
    expect(page.tasks.length).toBe(1);
    expect(page.totalHours).toBe(25);
    expect(page.streamHours('General')).toBe(25);
    page.toggleTask(page.tasks[0]);
    expect(page.tasks[0].active).toBe(false);
  });

  it('rejects invalid dates and negative hours without persisting', () => {
    const { page } = createPage();
    page.task = { ...page.emptyTask(), name: 'Testing', employee: 'Neha', start: '2026-10-22', end: '2026-10-01' };
    page.saveTask();
    expect(page.error).toContain('end date');
    page.task.end = '';
    page.task.hours = -1;
    page.saveTask();
    expect(page.error).toContain('hours');
    expect(page.tasks).toEqual([]);
    expect(localStorage.getItem(page.storageKey)).toBeNull();
  });
});
