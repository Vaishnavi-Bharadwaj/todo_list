import { Component } from '@angular/core';
import { DUMMY_MENU_LIST } from '../dummy-menu-list';
import { Router } from '@angular/router';
import { ListComponent } from './list/list.component';
@Component({
  selector: 'app-menu',
  imports: [ListComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  menu_list=DUMMY_MENU_LIST;
  selected!:boolean;
  isAddingTask:boolean=false;
  constructor(private router:Router) {}
  onSelectMenu(path:string)
  {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  onStartAddList()
  {
    this.isAddingTask=true;
  }

  onCancelAddList()
  {
    this.isAddingTask=false;
  }
}
