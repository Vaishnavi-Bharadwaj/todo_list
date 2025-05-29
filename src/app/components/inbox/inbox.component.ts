import { Component } from '@angular/core';
import { MenuComponent } from '../home/menu/menu.component';
interface Category {
  menu_id: string;
  name: string;
  icon: string;
  path:string;
}
@Component({
  selector: 'app-inbox',
  imports: [MenuComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {
  isCloseMenu:boolean=false;
  onCloseMenu()
  {
    this.isCloseMenu=!this.isCloseMenu; //toggle
  }

  category_list:Category[]=[];
  category_id!:string;
  constructor() {
    const menu_list=localStorage.getItem('menu_list');
    if(menu_list)
    {
      this.category_list=JSON.parse(menu_list) as Category[];
    }
  }

  onSelectCategory(menu_id:string)
  {
    this.category_id=menu_id;
  }
}
