import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';

export interface MenuItem {
  label: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-nav-menu',
  imports: [LucideChevronDown],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css'
})
export class NavMenu {
  @Input() label = '';
  @Input() items: MenuItem[] = [];
  @Output() selected = new EventEmitter<string>();
  open = false;
  submenu = '';

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    const wasOpen = this.open;
    document.dispatchEvent(new Event('close-nav-menus'));
    this.open = !wasOpen;
  }

  choose(item: MenuItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.children) {
      this.submenu = this.submenu === item.label ? '' : item.label;
      return;
    }
    this.close();
    this.selected.emit(item.label);
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  @HostListener('document:close-nav-menus')
  close(): void {
    this.open = false;
    this.submenu = '';
  }
}
