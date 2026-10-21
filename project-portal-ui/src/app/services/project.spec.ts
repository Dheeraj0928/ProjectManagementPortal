import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectService } from './project';

describe('ProjectService pagination', () => {
  let service: ProjectService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProjectService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the first ten projects by default', () => {
    service.getProjects().subscribe();
    const request = http.expectOne(req => req.url.endsWith('/api/projects'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('pageNumber')).toBe('1');
    expect(request.request.params.get('pageSize')).toBe('10');
    request.flush({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalProjects: 0, statusCounts: {} });
  });

  it('sends paging and filters together, including special search characters', () => {
    service.getProjects(2, 25, 'A&B', 'customer', 'In Progress').subscribe();
    const request = http.expectOne(req => req.url.endsWith('/api/projects'));
    expect(request.request.params.get('pageNumber')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('25');
    expect(request.request.params.get('searchText')).toBe('A&B');
    expect(request.request.params.get('searchColumn')).toBe('customer');
    expect(request.request.params.get('status')).toBe('In Progress');
    expect(request.request.urlWithParams).toContain('A%26B');
    request.flush({ items: [], pageNumber: 2, pageSize: 25, totalCount: 0, totalProjects: 0, statusCounts: {} });
  });
});
