import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../pagination/pagination';

interface Resource {
  id: string;
  name: string;
  email: string;
  joined: string;
  exited: string;
  role: string;
  department: string;
  projects: string;
  skills: string;
  experience: number;
  kekaManager: string;
  adManager: string;
  country: string;
  group: string;
  active: boolean;
}

@Component({
  selector: 'app-resources',
  imports: [FormsModule, Pagination],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class Resources {
  search = '';
  showFilters = true;
  active = true;
  manager = '';
  adManager = '';
  country = '';
  group = '';
  page = 1;
  showForm = false;
  error = '';
  selectedResource: Resource | null = null;
  readonly pageSize = 10;
  columns: { key: keyof Resource; label: string; visible: boolean }[] = [
    { key: 'id', label: 'Employee ID', visible: true },
    { key: 'name', label: 'Employee Name', visible: true },
    { key: 'email', label: 'Employee Email ID', visible: true },
    { key: 'joined', label: 'Date of Joining', visible: true },
    { key: 'exited', label: 'Date of Exit', visible: true },
    { key: 'role', label: 'Role', visible: true },
    { key: 'department', label: 'Department', visible: true },
    { key: 'projects', label: 'Current Projects', visible: true },
    { key: 'skills', label: 'Skills', visible: true },
    { key: 'experience', label: 'Experience (Years)', visible: true }
  ];
  records: Resource[] = [
    { id: 'EMP-101', name: 'Amit Sharma', email: 'amit@example.com', joined: '2023-07-24', exited: '', role: 'Developer', department: 'Engineering', projects: 'Customer Portal', skills: 'Angular, TypeScript', experience: 4, kekaManager: 'Priya Singh', adManager: 'Rahul Mehta', country: 'India', group: 'Development', active: true },
    { id: 'EMP-102', name: 'Neha Gupta', email: 'neha@example.com', joined: '2024-08-14', exited: '', role: 'QA Engineer', department: 'Engineering', projects: 'Inventory System', skills: 'Testing, SQL', experience: 3, kekaManager: 'Priya Singh', adManager: 'Rahul Mehta', country: 'India', group: 'Quality', active: true },
    { id: 'EMP-103', name: 'Arjun Rao', email: 'arjun@example.com', joined: '2022-03-10', exited: '', role: 'Technical Lead', department: 'Engineering', projects: 'Billing Portal', skills: '.NET, SQL Server', experience: 8, kekaManager: 'Vikram Patel', adManager: 'Anjali Verma', country: 'USA', group: 'Development', active: true },
    { id: 'EMP-104', name: 'Sneha Iyer', email: 'sneha@example.com', joined: '2025-01-06', exited: '', role: 'Business Analyst', department: 'Delivery', projects: 'Customer Portal', skills: 'Requirements, Reporting', experience: 5, kekaManager: 'Vikram Patel', adManager: 'Anjali Verma', country: 'USA', group: 'Delivery', active: true },
    { id: 'EMP-105', name: 'Rohit Jain', email: 'rohit@example.com', joined: '2021-06-15', exited: '2026-06-04', role: 'Developer', department: 'Engineering', projects: '', skills: 'JavaScript, CSS', experience: 6, kekaManager: 'Priya Singh', adManager: 'Rahul Mehta', country: 'India', group: 'Development', active: false }
  ];
  draft = this.emptyResource();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('portal-added-resources');
        const added = saved ? JSON.parse(saved) : [];
        if (Array.isArray(added)) {
          this.records = [...this.records, ...added.filter(item =>
            item && typeof item.id === 'string' && typeof item.name === 'string' &&
            typeof item.email === 'string' && typeof item.active === 'boolean')];
        }
      } catch { /* Keep the sample list if browser storage is unavailable. */ }
    }
  }

  emptyResource(): Resource {
    return { id: '', name: '', email: '', joined: '', exited: '', role: '', department: '', projects: '', skills: '', experience: 0, kekaManager: '', adManager: '', country: '', group: '', active: true };
  }

  options(key: keyof Resource): string[] {
    return [...new Set(this.records.map(row => String(row[key])).filter(Boolean))];
  }

  get visibleColumns() { return this.columns.filter(column => column.visible); }

  get filtered(): Resource[] {
    const text = this.search.trim().toLowerCase();
    return this.records.filter(row => row.active === this.active &&
      (row.name.toLowerCase().includes(text) || row.email.toLowerCase().includes(text)) &&
      (!this.manager || row.kekaManager === this.manager) &&
      (!this.adManager || row.adManager === this.adManager) &&
      (!this.country || row.country === this.country) &&
      (!this.group || row.group === this.group));
  }

  get rows(): Resource[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }

  clearFilters(): void {
    this.search = this.manager = this.adManager = this.country = this.group = '';
    this.columns.forEach(column => column.visible = true);
    this.page = 1;
  }

  startAdd(): void {
    this.draft = this.emptyResource();
    this.error = '';
    this.showForm = true;
  }

  save(): void {
    if (!this.draft.id.trim() || !this.draft.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.draft.email.trim())) {
      this.error = 'Employee ID, name and a valid email are required.';
      return;
    }
    if (this.records.some(row => row.id.toLowerCase() === this.draft.id.trim().toLowerCase())) {
      this.error = 'Employee ID already exists.';
      return;
    }
    if (this.draft.experience === null || !Number.isFinite(this.draft.experience) || this.draft.experience < 0) {
      this.error = 'Experience must be zero or more.';
      return;
    }
    const resource = { ...this.draft, id: this.draft.id.trim(), name: this.draft.name.trim(), email: this.draft.email.trim() };
    try {
      const added = this.records.filter(row => !['EMP-101', 'EMP-102', 'EMP-103', 'EMP-104', 'EMP-105'].includes(row.id));
      window.localStorage.setItem('portal-added-resources', JSON.stringify([...added, resource]));
    } catch {
      this.error = 'Browser storage is unavailable. Resource was not saved.';
      return;
    }
    this.records = [...this.records, resource];
    this.active = true;
    this.clearFilters();
    this.showForm = false;
  }

  exportCsv(): void {
    const cell = (value: unknown) => {
      let text = String(value ?? '');
      if (/^[=+@\-\t\r]/.test(text)) { text = "'" + text; }
      return '"' + text.replace(/"/g, '""') + '"';
    };
    const lines = [this.visibleColumns.map(column => cell(column.label)).join(','),
      ...this.filtered.map(row => this.visibleColumns.map(column => cell(row[column.key])).join(','))];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resources.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
