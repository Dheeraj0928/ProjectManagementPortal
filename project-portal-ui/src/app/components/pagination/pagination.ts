import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  imports: [FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() itemCount = 0;
  @Input() loading = false;
  @Input() itemLabel = 'items';
  @Input() pageSizeOptions = [10, 25, 50];
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get firstItem(): number {
    if (this.itemCount === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get lastItem(): number {
    if (this.itemCount === 0) {
      return 0;
    }
    return Math.min(this.totalCount, this.firstItem + this.itemCount - 1);
  }

  changePage(page: number): void {
    if (this.loading || page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }

  changePageSize(size: number): void {
    if (this.loading || size === this.pageSize || !this.pageSizeOptions.includes(size)) {
      return;
    }
    this.pageSizeChange.emit(size);
  }
}
