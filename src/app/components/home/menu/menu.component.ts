import { Component } from '@angular/core';
import { DUMMY_MENU_LIST } from '../dummy-menu-list';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  menu_list=DUMMY_MENU_LIST;
  selected!:boolean;
}
