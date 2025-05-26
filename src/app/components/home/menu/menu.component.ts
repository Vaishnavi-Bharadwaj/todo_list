import { Component, Input } from '@angular/core';
import { DUMMY_MENU_LIST } from '../dummy-menu-list';
import { Router } from '@angular/router';
@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  menu_list=DUMMY_MENU_LIST;
  selected!:boolean;
  constructor(private router:Router) {}
  onSelectMenu(path:string)
  {
    this.router.navigate([path]);
  }
  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
