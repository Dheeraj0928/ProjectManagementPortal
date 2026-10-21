import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

describe('Reusable Pagination', () => {
  let fixture: ComponentFixture<Pagination>;
  let component: Pagination;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Pagination] }).compileComponents();
    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('shows partial last-page ranges with a configurable item label', async () => {
    fixture.componentRef.setInput('currentPage', 3);
    fixture.componentRef.setInput('totalCount', 24);
    fixture.componentRef.setInput('itemCount', 4);
    fixture.componentRef.setInput('itemLabel', 'employees');
    await fixture.whenStable();
    expect(component.firstItem).toBe(21);
    expect(component.lastItem).toBe(24);
    expect(component.totalPages).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('of 24 employees');
    const next = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    expect(next.disabled).toBe(true);
  });

  it('emits valid page changes without changing the parent-owned page number', async () => {
    fixture.componentRef.setInput('totalCount', 24);
    fixture.componentRef.setInput('itemCount', 10);
    await fixture.whenStable();
    const emit = vi.spyOn(component.pageChange, 'emit');
    const next = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    next.click();
    expect(emit).toHaveBeenCalledExactlyOnceWith(2);
    expect(component.currentPage).toBe(1);
    component.changePage(0);
    component.changePage(4);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('emits a numeric page size from the dropdown', async () => {
    const emit = vi.spyOn(component.pageSizeChange, 'emit');
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = select.options[1].value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    expect(emit).toHaveBeenCalledExactlyOnceWith(25);
    expect(component.pageSize).toBe(10);
  });

  it('handles empty lists and blocks actions while loading', async () => {
    expect(component.firstItem).toBe(0);
    expect(component.lastItem).toBe(0);
    expect(component.totalPages).toBe(1);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('totalCount', 24);
    await fixture.whenStable();
    const page = vi.spyOn(component.pageChange, 'emit');
    const size = vi.spyOn(component.pageSizeChange, 'emit');
    component.changePage(2);
    component.changePageSize(25);
    expect(page).not.toHaveBeenCalled();
    expect(size).not.toHaveBeenCalled();
    const controls = Array.from(fixture.nativeElement.querySelectorAll('button, select')) as (
      HTMLButtonElement | HTMLSelectElement
    )[];
    expect(controls.every((control) => control.disabled)).toBe(true);
  });
});
