import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { LucideChevronDown, LucideUserRound, LucideMail, LucideShieldCheck, LucideLogOut } from '@lucide/angular';

@Component({
  selector: 'app-profile',
  imports: [LucideChevronDown, LucideUserRound, LucideMail, LucideShieldCheck, LucideLogOut],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  @Output() signOut = new EventEmitter<void>();
  open = false;
  name = 'Dheeraj';
  email = 'dheeraj.yadav@svam.com';
  role = 'PMO, Admin';

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    const wasOpen = this.open;
    document.dispatchEvent(new Event('close-nav-menus'));
    this.open = !wasOpen;
  }

  logout(): void {
    this.open = false;
    this.signOut.emit();
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  @HostListener('document:close-nav-menus')
  close(): void {
    this.open = false;
  }
}
