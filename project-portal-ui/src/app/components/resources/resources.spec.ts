import { beforeEach, describe, expect, it } from 'vitest';
import { Resources } from './resources';

describe('Resources', () => {
  beforeEach(() => localStorage.clear());

  it('combines active status, search and manager filters', () => {
    const page = new Resources();
    expect(page.filtered.length).toBe(4);
    page.search = 'NEHA';
    page.manager = 'Priya Singh';
    expect(page.filtered.map(row => row.id)).toEqual(['EMP-102']);
    page.country = 'USA';
    expect(page.filtered).toEqual([]);
    page.clearFilters();
    page.active = false;
    expect(page.filtered.map(row => row.id)).toEqual(['EMP-105']);
  });

  it('saves a valid new resource and restores it on the next visit', () => {
    const page = new Resources();
    page.draft = { ...page.emptyResource(), id: 'EMP-200', name: 'New Employee', email: 'new@example.com', skills: 'Angular' };
    page.save();
    expect(page.error).toBe('');
    expect(new Resources().records.find(row => row.id === 'EMP-200')?.skills).toBe('Angular');
  });

  it('rejects duplicate employee IDs and invalid emails without saving', () => {
    const page = new Resources();
    page.draft = { ...page.emptyResource(), id: 'emp-101', name: 'Duplicate', email: 'valid@example.com' };
    page.save();
    expect(page.error).toBe('Employee ID already exists.');
    page.draft.email = 'invalid';
    page.save();
    expect(page.records.length).toBe(5);
    expect(localStorage.getItem('portal-added-resources')).toBeNull();
  });
});
